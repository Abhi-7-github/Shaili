const mongoose = require('mongoose');
const WardrobeItem = require('../models/WardrobeItem');
const { uploadToCloudinaryBuffer, deleteFromCloudinary } = require('../services/cloudinary.service');
const { analyzeClothingImage } = require('../services/vision.service');
const { normalizeColor } = require('../services/color.service');
const { getUnderusedGarments } = require('../services/insights.service');

// Input Sanitizers to guarantee Mongoose Schema Compliance
const sanitizeCategory = (cat) => {
  if (!cat) return 'top';
  const c = String(cat).toLowerCase().trim();
  if (c.includes('top')) return 'top';
  if (c.includes('bottom') || c.includes('pant') || c.includes('jean') || c.includes('skirt') || c.includes('short')) return 'bottom';
  if (c.includes('foot') || c.includes('shoe') || c.includes('sneaker') || c.includes('boot')) return 'footwear';
  if (c.includes('outer') || c.includes('jacket') || c.includes('coat') || c.includes('blazer')) return 'outerwear';
  if (c.includes('access')) return 'accessory';
  if (c.includes('dress') || c.includes('full') || c.includes('ethwear') || c.includes('saree') || c.includes('gown')) return 'dress';
  return 'top';
};

const sanitizePattern = (pat) => {
  if (!pat) return 'solid';
  const p = String(pat).toLowerCase().trim();
  const valid = ['solid', 'striped', 'checked', 'printed', 'floral', 'textured', 'other'];
  if (valid.includes(p)) return p;
  if (p.includes('stripe')) return 'striped';
  if (p.includes('check')) return 'checked';
  if (p.includes('print')) return 'printed';
  if (p.includes('flower') || p.includes('floral')) return 'floral';
  if (p.includes('texture')) return 'textured';
  return 'solid';
};

const sanitizeMaterial = (mat) => {
  if (!mat) return 'cotton';
  const m = String(mat).toLowerCase().trim();
  const valid = ['cotton', 'denim', 'wool', 'linen', 'silk', 'synthetic', 'leather', 'unknown'];
  if (valid.includes(m)) return m;
  if (m.includes('jean')) return 'denim';
  if (m.includes('leather')) return 'leather';
  if (m.includes('poly') || m.includes('nylon') || m.includes('spandex')) return 'synthetic';
  return 'cotton';
};

const sanitizeStyle = (sty) => {
  if (!sty) return 'casual';
  const s = String(sty).toLowerCase().trim().replace(/\s+/g, '-');
  const valid = ['casual', 'formal', 'ethnic', 'streetwear', 'smart-casual', 'sporty', 'party', 'traditional'];
  if (valid.includes(s)) return s;
  if (s.includes('smart')) return 'smart-casual';
  if (s.includes('street')) return 'streetwear';
  if (s.includes('trad')) return 'traditional';
  if (s.includes('form')) return 'formal';
  if (s.includes('party')) return 'party';
  return 'casual';
};

const sanitizeFormality = (form, style) => {
  if (typeof form === 'number' && !isNaN(form)) {
    return Math.min(5, Math.max(1, Math.round(form)));
  }
  const f = String(form || '').toLowerCase().trim();
  if (['1', '2', '3', '4', '5'].includes(f)) {
    return Number(f);
  }
  if (f.includes('casual')) return 2;
  if (f.includes('semi') || f.includes('smart')) return 3;
  if (f.includes('formal')) return 5;

  const s = String(style).toLowerCase();
  if (s.includes('formal')) return 5;
  if (s.includes('smart')) return 4;
  return 3;
};

const parseArrayInput = (input) => {
  if (!input) return [];
  if (Array.isArray(input)) return input;
  if (typeof input === 'string') {
    const trimmed = input.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parsed;
      } catch (err) {
        // fallthrough
      }
    }
    return trimmed.split(',').map((s) => s.trim());
  }
  return [];
};

const sanitizeSeasons = (seasonsInput) => {
  const arr = parseArrayInput(seasonsInput);
  const result = arr
    .map((s) => String(s).toLowerCase().trim())
    .filter((s) => s.length > 0);
  return result.length > 0 ? result : ['summer', 'winter', 'monsoon'];
};

const sanitizeOccasions = (occasionsInput) => {
  const arr = parseArrayInput(occasionsInput);
  const result = arr
    .map((o) => String(o).toLowerCase().trim())
    .filter((o) => o.length > 0);
  return result.length > 0 ? result : ['casual', 'college', 'office'];
};

/**
 * @desc    Analyze clothing image without saving to DB
 * @route   POST /api/wardrobe/analyze
 * @access  Private
 */
const analyzeClothing = async (req, res, next) => {
  try {
    let imageUrl = req.body.imageUrl;
    let originalName = 'uploaded_clothing.jpg';
    const userId = req.user ? req.user._id : new mongoose.Types.ObjectId('6aa572ed8f0f8f683821f0aa');

    if (req.file) {
      originalName = req.file.originalname;
      const uploadRes = await uploadToCloudinaryBuffer(req.file.buffer, userId.toString(), originalName);
      imageUrl = uploadRes.secureUrl;
    }

    if (!imageUrl) {
      return res.status(400).json({
        success: false,
        error: { code: 'MISSING_IMAGE', message: 'Please upload an image file or provide an imageUrl to analyze.' },
      });
    }

    const metadata = await analyzeClothingImage(imageUrl, originalName);

    return res.status(200).json({
      success: true,
      data: {
        imageUrl,
        metadata,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Upload image to Cloudinary, analyze metadata, and save WardrobeItem in MongoDB
 * @route   POST /api/wardrobe/upload
 * @access  Private
 */
const uploadWardrobeItem = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : new mongoose.Types.ObjectId('6aa572ed8f0f8f683821f0aa');

    if (!req.file && !req.body.imageUrl) {
      return res.status(400).json({
        success: false,
        error: { code: 'FILE_REQUIRED', message: 'No clothing image uploaded. Please attach an image file.' },
      });
    }

    let imageUrl = req.body.imageUrl;
    let cloudinaryPublicId = `shaili_wardrobe/${userId}/${Date.now()}`;

    if (req.file) {
      const cloudinaryResult = await uploadToCloudinaryBuffer(
        req.file.buffer,
        userId.toString(),
        req.file.originalname
      );
      imageUrl = cloudinaryResult.secureUrl;
      cloudinaryPublicId = cloudinaryResult.publicId;
    }

    // AI Analysis
    const aiAnalysis = await analyzeClothingImage(imageUrl, req.file ? req.file.originalname : '');

    // Allow user overrides if provided in request body
    const rawCategory = req.body.category || aiAnalysis.category;
    const rawType = req.body.type || req.body.garmentType || aiAnalysis.type || 'Garment';
    const primaryColorInput = req.body.primaryColor || aiAnalysis.primaryColor;
    const secondaryColorInput = req.body.secondaryColor || aiAnalysis.secondaryColor;

    const colorMeta = normalizeColor(primaryColorInput, secondaryColorInput);

    const category = sanitizeCategory(rawCategory);
    const type = String(rawType).trim() || 'Garment';
    const pattern = sanitizePattern(req.body.pattern || aiAnalysis.pattern);
    const material = sanitizeMaterial(req.body.material || aiAnalysis.material);
    const style = sanitizeStyle(req.body.style || aiAnalysis.style);
    const formality = sanitizeFormality(req.body.formality || aiAnalysis.formality, style);
    const seasons = sanitizeSeasons(req.body.seasons || req.body.season || aiAnalysis.seasons);
    const occasions = sanitizeOccasions(req.body.occasions || aiAnalysis.occasions);

    const newItem = await WardrobeItem.create({
      userId,
      imageUrl,
      cloudinaryPublicId,
      category,
      type,
      primaryColor: colorMeta.primaryColor,
      secondaryColor: colorMeta.secondaryColor,
      colorFamily: colorMeta.colorFamily,
      hex: colorMeta.hex,
      hue: colorMeta.hue,
      saturation: colorMeta.saturation,
      lightness: colorMeta.lightness,
      pattern,
      material,
      style,
      formality,
      seasons,
      occasions,
      timesWorn: 0,
      lastWorn: null,
    });

    return res.status(201).json({
      success: true,
      data: newItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's wardrobe items with filter options
 * @route   GET /api/wardrobe
 * @access  Private
 */
const getWardrobeItems = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : null;
    const { category, color, style, occasion, season, underused } = req.query;

    if (underused === 'true') {
      const underusedList = await getUnderusedGarments(userId);
      return res.status(200).json({
        success: true,
        data: underusedList,
      });
    }

    // Check if current user has any wardrobe items; if not, fallback to all catalog items
    let userHasItems = false;
    if (userId) {
      userHasItems = await WardrobeItem.exists({ userId });
    }
    const query = (userId && userHasItems) ? { userId } : {};

    // 1. Category Filter
    if (category && String(category).toLowerCase() !== 'all') {
      const c = String(category).toLowerCase().trim();
      if (c.includes('top')) {
        query.category = { $in: ['top', 'tops', 'Tops'] };
      } else if (c.includes('bottom') || c.includes('pant') || c.includes('jean') || c.includes('short')) {
        query.category = { $in: ['bottom', 'bottoms', 'Bottoms'] };
      } else if (c.includes('foot') || c.includes('shoe') || c.includes('sneaker')) {
        query.category = { $in: ['footwear', 'Footwear'] };
      } else if (c.includes('outer') || c.includes('jacket') || c.includes('coat')) {
        query.category = { $in: ['outerwear', 'Outerwear'] };
      } else if (c.includes('access')) {
        query.category = { $in: ['accessory', 'accessories', 'Accessories'] };
      } else if (c.includes('dress') || c.includes('ethnic')) {
        query.category = { $in: ['dress', 'dresses', 'Ethnic'] };
      } else {
        query.category = new RegExp(category.trim(), 'i');
      }
    }

    // 2. Color Filter
    if (color && String(color).toLowerCase() !== 'all') {
      const colorRegex = new RegExp(color.trim(), 'i');
      query.$or = [
        { primaryColor: colorRegex },
        { secondaryColor: colorRegex },
        { colorFamily: colorRegex }
      ];
    }

    // 3. Style Filter
    if (style && String(style).toLowerCase() !== 'all') {
      const s = String(style).toLowerCase().trim();
      if (s.includes('smart')) {
        query.style = { $in: ['smart-casual', 'smart casual', 'Smart Casual', 'casual'] };
      } else if (s.includes('street')) {
        query.style = { $in: ['streetwear', 'Streetwear'] };
      } else if (s.includes('ethnic') || s.includes('trad')) {
        query.style = { $in: ['ethnic', 'traditional', 'Ethnic', 'Traditional'] };
      } else if (s.includes('form')) {
        query.style = { $in: ['formal', 'Formal'] };
      } else if (s.includes('party')) {
        query.style = { $in: ['party', 'Party'] };
      } else {
        query.style = new RegExp(style.trim(), 'i');
      }
    }

    // 4. Occasion Filter
    if (occasion && String(occasion).toLowerCase() !== 'all') {
      query.occasions = { $in: [new RegExp(occasion.trim(), 'i')] };
    }

    // 5. Season Filter
    if (season && String(season).toLowerCase() !== 'all' && String(season).toLowerCase() !== 'all-season') {
      const s = String(season).toLowerCase().trim();
      query.seasons = { $in: [new RegExp(s, 'i'), /all/i, /all-season/i] };
    }

    console.log(`[getWardrobeItems] User: ${userId} (${req.user?.email}), userHasItems: ${!!userHasItems}, query:`, JSON.stringify(query));
    const items = await WardrobeItem.find(query).sort({ createdAt: -1 });
    console.log(`[getWardrobeItems] Returning ${items.length} items to client`);

    return res.status(200).json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get underused wardrobe items
 * @route   GET /api/wardrobe/underused
 * @access  Private
 */
const getUnderused = async (req, res, next) => {
  try {
    const userId = req.user ? req.user._id : new mongoose.Types.ObjectId('6aa572ed8f0f8f683821f0aa');
    const underusedList = await getUnderusedGarments(userId);
    return res.status(200).json({
      success: true,
      count: underusedList.length,
      data: underusedList,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single wardrobe item by ID
 * @route   GET /api/wardrobe/:id
 * @access  Private
 */
const getWardrobeItemById = async (req, res, next) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Wardrobe item not found.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: item,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update wardrobe item metadata
 * @route   PUT /api/wardrobe/:id
 * @access  Private
 */
const updateWardrobeItem = async (req, res, next) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Wardrobe item not found.' },
      });
    }

    const updates = { ...req.body };
    delete updates.userId;
    delete updates._id;

    if (updates.category) updates.category = sanitizeCategory(updates.category);
    if (updates.garmentType && !updates.type) updates.type = String(updates.garmentType).trim();
    if (updates.type) updates.type = String(updates.type).trim();
    if (updates.pattern) updates.pattern = sanitizePattern(updates.pattern);
    if (updates.material) updates.material = sanitizeMaterial(updates.material);
    if (updates.style) updates.style = sanitizeStyle(updates.style);
    if (updates.formality !== undefined) updates.formality = sanitizeFormality(updates.formality, updates.style || item.style);
    if (updates.seasons || updates.season) updates.seasons = sanitizeSeasons(updates.seasons || updates.season);
    if (updates.occasions) updates.occasions = sanitizeOccasions(updates.occasions);

    if (updates.primaryColor || updates.secondaryColor) {
      const colorMeta = normalizeColor(
        updates.primaryColor || item.primaryColor,
        updates.secondaryColor || item.secondaryColor
      );
      updates.primaryColor = colorMeta.primaryColor;
      updates.colorFamily = colorMeta.colorFamily;
      updates.hex = colorMeta.hex;
      updates.hue = colorMeta.hue;
      updates.saturation = colorMeta.saturation;
      updates.lightness = colorMeta.lightness;
    }

    const updatedItem = await WardrobeItem.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
    });

    return res.status(200).json({
      success: true,
      data: updatedItem,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete wardrobe item from DB and Cloudinary
 * @route   DELETE /api/wardrobe/:id
 * @access  Private
 */
const deleteWardrobeItem = async (req, res, next) => {
  try {
    const item = await WardrobeItem.findById(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Wardrobe item not found.' },
      });
    }

    if (item.cloudinaryPublicId) {
      await deleteFromCloudinary(item.cloudinaryPublicId);
    }

    await item.deleteOne();

    return res.status(200).json({
      success: true,
      data: { id: req.params.id, message: 'Wardrobe item deleted successfully.' },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  analyzeClothing,
  uploadWardrobeItem,
  getWardrobeItems,
  getUnderused,
  getWardrobeItemById,
  updateWardrobeItem,
  deleteWardrobeItem,
};
