const { generateStylistOutfits } = require('../services/stylist.service');

/**
 * @desc    Generate interactive AI outfit combinations from user's wardrobe
 * @route   POST /api/stylist/generate
 * @access  Private
 */
const generateOutfitRecommendations = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { occasion, style, weather, preferences } = req.body;

    const outfits = await generateStylistOutfits({
      userId,
      occasion: occasion || 'college',
      style: style || 'smart-casual',
      weather: weather || { temperature: 28, condition: 'sunny' },
      preferences: preferences || { preferredColors: [], avoidColors: [], preferredStyles: [] },
    });

    return res.status(200).json({
      success: true,
      data: {
        outfits,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  generateOutfitRecommendations,
};
