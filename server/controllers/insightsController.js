const { getWardrobeInsights } = require('../services/insights.service');

/**
 * @desc    Get wardrobe analytics, underused garment tracking, utilization %, and gap detection
 * @route   GET /api/insights
 * @access  Private
 */
const getInsights = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const analytics = await getWardrobeInsights(userId);

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
};
