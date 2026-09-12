const Outfit = require('../models/Outfit');
const WardrobeItem = require('../models/WardrobeItem');

/**
 * @desc    Save new outfit record
 * @route   POST /api/outfits
 * @access  Private
 */
const createOutfit = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { garmentIds, occasion, style, weather, score } = req.body;

    if (!garmentIds || !Array.isArray(garmentIds) || garmentIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_GARMENTS', message: 'At least one garment ID is required to create an outfit.' },
      });
    }

    const newOutfit = await Outfit.create({
      userId,
      garmentIds,
      occasion: occasion || 'casual',
      style: style || 'casual',
      weather: weather || { temperature: 25, condition: 'sunny' },
      score: score || 85,
    });

    // Update timesWorn & lastWorn for garments
    await WardrobeItem.updateMany(
      { _id: { $in: garmentIds }, userId },
      { $inc: { timesWorn: 1 }, $set: { lastWorn: new Date() } }
    );

    return res.status(201).json({
      success: true,
      data: newOutfit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get user's outfit history
 * @route   GET /api/outfits
 * @access  Private
 */
const getOutfits = async (req, res, next) => {
  try {
    const outfits = await Outfit.find({ userId: req.user._id })
      .populate('garmentIds')
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: outfits.length,
      data: outfits,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get outfit by ID
 * @route   GET /api/outfits/:id
 * @access  Private
 */
const getOutfitById = async (req, res, next) => {
  try {
    const outfit = await Outfit.findById(req.params.id).populate('garmentIds');

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Outfit record not found.' },
      });
    }

    if (outfit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to access this outfit record.' },
      });
    }

    return res.status(200).json({
      success: true,
      data: outfit,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Mark outfit as worn
 * @route   POST /api/outfits/:id/wear
 * @access  Private
 */
const markOutfitWorn = async (req, res, next) => {
  try {
    const outfit = await Outfit.findById(req.params.id);

    if (!outfit) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Outfit record not found.' },
      });
    }

    if (outfit.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized to update this outfit record.' },
      });
    }

    outfit.wornCount = (outfit.wornCount || 1) + 1;
    outfit.lastWorn = new Date();
    await outfit.save();

    // Increment timesWorn and update lastWorn on all garments
    await WardrobeItem.updateMany(
      { _id: { $in: outfit.garmentIds }, userId: req.user._id },
      { $inc: { timesWorn: 1 }, $set: { lastWorn: new Date() } }
    );

    return res.status(200).json({
      success: true,
      data: outfit,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOutfit,
  getOutfits,
  getOutfitById,
  markOutfitWorn,
};
