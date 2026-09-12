const Image = require('../models/Image');
const { uploadToCloudinary, deleteFromCloudinary } = require('../services/cloudinaryService');
const { analyzeImage } = require('../services/imageAnalysisService');
const { parseQuery } = require('../services/queryUnderstandingService');
const { searchUserImages } = require('../services/imageSearchService');

// Allowed image MIME types
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB limit

// @desc    Upload new user memory image (1 photo at a time)
// @route   POST /api/images/upload
// @access  Private
const uploadImage = async (req, res) => {
  try {
    const userId = req.user._id;

    // 1. File existence validation
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please select 1 photo to upload.',
      });
    }

    // 2. MIME type validation
    if (!ALLOWED_MIME_TYPES.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file format. Only JPEG, PNG, WEBP, and GIF images are allowed.',
      });
    }

    // 3. File size validation
    if (req.file.size > MAX_FILE_SIZE) {
      return res.status(400).json({
        success: false,
        message: 'File size exceeds the 10MB limit.',
      });
    }

    const gender = (req.body.gender || 'unisex').toLowerCase();

    // 4. Upload to Cloudinary
    const cloudinaryResult = await uploadToCloudinary(
      req.file.buffer,
      userId,
      req.file.originalname
    );

    // 5. Analyze and classify image metadata
    const { categories, tags, description } = await analyzeImage(
      req.file.originalname,
      req.body.categories,
      req.body.tags,
      req.body.description
    );

    // Add gender tag
    const mergedTags = Array.from(new Set([...tags, gender]));

    // 6. Save in MongoDB with userId & gender
    const newImage = await Image.create({
      userId,
      cloudinaryPublicId: cloudinaryResult.publicId,
      cloudinaryUrl: cloudinaryResult.secureUrl,
      originalName: req.file.originalname,
      categories,
      tags: mergedTags,
      description,
      gender,
      uploadedAt: new Date(),
    });

    return res.status(201).json({
      success: true,
      message: 'Memory photo uploaded and indexed successfully in Cloudinary!',
      image: {
        id: newImage._id,
        url: newImage.cloudinaryUrl,
        categories: newImage.categories,
        tags: newImage.tags,
        description: newImage.description,
        gender: newImage.gender,
        uploadedAt: newImage.uploadedAt,
      },
    });
  } catch (error) {
    console.error('Image Upload Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error uploading image',
    });
  }
};



// @desc    Search user's memory images using natural language queries
// @route   GET /api/images/search?q=
// @access  Private
const searchImages = async (req, res) => {
  try {
    const userId = req.user._id;
    const queryStr = req.query.q || '';

    if (!queryStr.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Search query parameter (q) is required',
      });
    }

    // 1. Understand Query Criteria
    const parsedCriteria = await parseQuery(queryStr);

    // 2. Search Database scoped to userId
    const results = await searchUserImages(userId, parsedCriteria, queryStr);

    // Format response
    const formattedImages = results.map((img) => ({
      id: img._id,
      url: img.cloudinaryUrl,
      categories: img.categories,
      tags: img.tags,
      description: img.description,
      uploadedAt: img.uploadedAt,
    }));

    return res.status(200).json({
      success: true,
      query: queryStr,
      filters: {
        categories: parsedCriteria.categories,
        keywords: parsedCriteria.keywords,
      },
      count: formattedImages.length,
      images: formattedImages,
    });
  } catch (error) {
    console.error('Search Images Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error searching images',
    });
  }
};

// @desc    Get all uploaded images for authenticated user
// @route   GET /api/images
// @access  Private
const getUserImages = async (req, res) => {
  try {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const category = req.query.category;
    const tag = req.query.tag;
    const sort = req.query.sort === 'oldest' ? 1 : -1;

    // Strict user scoping
    const query = { userId };

    if (category) {
      query.categories = category.toLowerCase();
    }
    if (tag) {
      query.tags = tag.toLowerCase();
    }

    const skip = (page - 1) * limit;

    const totalCount = await Image.countDocuments(query);
    const images = await Image.find(query)
      .sort({ uploadedAt: sort })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedImages = images.map((img) => ({
      id: img._id,
      url: img.cloudinaryUrl,
      categories: img.categories,
      tags: img.tags,
      description: img.description,
      uploadedAt: img.uploadedAt,
    }));

    return res.status(200).json({
      success: true,
      count: formattedImages.length,
      total: totalCount,
      page,
      pages: Math.ceil(totalCount / limit),
      images: formattedImages,
    });
  } catch (error) {
    console.error('Get User Images Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching user images',
    });
  }
};

// @desc    Delete a specific memory image
// @route   DELETE /api/images/:id
// @access  Private
const deleteImage = async (req, res) => {
  try {
    const userId = req.user._id;
    const imageId = req.params.id;

    // Find image
    const image = await Image.findById(imageId);

    if (!image) {
      return res.status(404).json({
        success: false,
        message: 'Image memory not found',
      });
    }

    // STRICT Ownership Validation: User can NEVER delete another user's image
    if (image.userId.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You can only delete your own uploaded images',
      });
    }

    // Delete from Cloudinary
    await deleteFromCloudinary(image.cloudinaryPublicId);

    // Delete from MongoDB
    await Image.findByIdAndDelete(imageId);

    return res.status(200).json({
      success: true,
      message: 'Image memory deleted successfully',
      id: imageId,
    });
  } catch (error) {
    console.error('Delete Image Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting image',
    });
  }
};

// @desc    Train ML feature extraction & memory classification model for user's stored images
// @route   POST /api/images/train-model
// @access  Private
const trainModelController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { trainModel } = require('../services/modelTrainingService');

    const result = await trainModel(userId);

    return res.status(200).json({
      success: true,
      message: 'SHAILI ML classification model successfully trained and re-indexed!',
      data: result,
    });
  } catch (error) {
    console.error('Train Model Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error training model',
    });
  }
};

// @desc    Generate outfit combinations from selected wardrobe items
// @route   POST /api/images/outfits/from-wardrobe
// @access  Private
const generateOutfitFromWardrobe = async (req, res) => {
  try {
    const userId = req.user._id;
    const { itemIds, occasion, style } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one wardrobe item.' });
    }

    // Fetch items strictly scoped to the user
    const items = await Image.find({ _id: { $in: itemIds }, userId }).lean();

    if (items.length === 0) {
      return res.status(404).json({ success: false, message: 'No valid wardrobe items found or you do not have permission.' });
    }

    // Deterministic categorization based on tags and categories
    const categorizeItem = (item) => {
      const text = [...(item.categories || []), ...(item.tags || [])].join(' ').toLowerCase();
      if (text.includes('shirt') || text.includes('t-shirt') || text.includes('top') || text.includes('kurta') || text.includes('sweater') || text.includes('jacket') || text.includes('blouse')) return 'top';
      if (text.includes('pant') || text.includes('jeans') || text.includes('trouser') || text.includes('shorts') || text.includes('skirt') || text.includes('bottom') || text.includes('legging')) return 'bottom';
      if (text.includes('shoe') || text.includes('sneaker') || text.includes('boot') || text.includes('heel') || text.includes('sandal') || text.includes('footwear') || text.includes('flat')) return 'footwear';
      if (text.includes('dress') || text.includes('saree') || text.includes('lehenga') || text.includes('suit') || text.includes('gown')) return 'dress';
      return 'accessory';
    };

    const categorized = { top: [], bottom: [], footwear: [], dress: [], accessory: [] };
    items.forEach(item => {
      const cat = categorizeItem(item);
      categorized[cat].push({
        id: item._id,
        url: item.cloudinaryUrl,
        categories: item.categories,
        tags: item.tags
      });
    });

    const combinations = [];

    // Combination 1: Top + Bottom (+ Footwear if available)
    if (categorized.top.length > 0 && categorized.bottom.length > 0) {
      const outfit = [categorized.top[0], categorized.bottom[0]];
      if (categorized.footwear.length > 0) outfit.push(categorized.footwear[0]);
      combinations.push({
        items: outfit,
        occasion: occasion || 'Casual',
        style: style || 'Smart Casual',
        reason: 'These pieces naturally complement each other for a balanced, everyday look.'
      });
    }

    // Combination 2: Dress (+ Footwear if available)
    if (categorized.dress.length > 0) {
      const outfit = [categorized.dress[0]];
      if (categorized.footwear.length > 0) outfit.push(categorized.footwear[0]);
      combinations.push({
        items: outfit,
        occasion: occasion || 'Formal',
        style: style || 'Elegant',
        reason: 'This one-piece look is effortlessly put together and ready for any occasion.'
      });
    }

    // Combination 3: Alternative Top + Bottom
    if (combinations.length < 3 && categorized.top.length > 1 && categorized.bottom.length > 1) {
      const outfit = [categorized.top[1], categorized.bottom[1]];
      if (categorized.footwear.length > 1) outfit.push(categorized.footwear[1]);
      else if (categorized.footwear.length > 0) outfit.push(categorized.footwear[0]);
      
      combinations.push({
        items: outfit,
        occasion: occasion || 'Semi-formal',
        style: style || 'Modern',
        reason: 'An alternative pairing from your selected items that offers a different silhouette.'
      });
    }
    
    // Combination 4: Top + Accessory
    if (combinations.length < 3 && categorized.top.length > 0 && categorized.accessory.length > 0) {
      const outfit = [categorized.top[0], categorized.accessory[0]];
      if (categorized.bottom.length > 0) outfit.push(categorized.bottom[0]);
      
      combinations.push({
        items: outfit,
        occasion: occasion || 'Casual',
        style: style || 'Detailed',
        reason: 'The accessory adds a thoughtful touch to highlight the upper wear.'
      });
    }

    // Fallback if no specific combinations could be made (e.g. only 1 item selected, or all tops)
    if (combinations.length === 0) {
      combinations.push({
        items: items.map(item => ({ id: item._id, url: item.cloudinaryUrl, categories: item.categories, tags: item.tags })),
        occasion: occasion || 'Any',
        style: style || 'Your Style',
        reason: 'Here is what you selected. We recommend adding a wider variety of items (tops, bottoms, footwear) to generate complete outfits.'
      });
    }

    return res.status(200).json({
      success: true,
      outfits: combinations.slice(0, 3)
    });
  } catch (error) {
    console.error('Generate Outfit Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Server error generating outfit'
    });
  }
};

module.exports = {
  uploadImage,
  searchImages,
  getUserImages,
  deleteImage,
  trainModelController,
  generateOutfitFromWardrobe,
};

