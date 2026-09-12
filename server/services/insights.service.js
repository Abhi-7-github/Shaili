const WardrobeItem = require('../models/WardrobeItem');
const Outfit = require('../models/Outfit');

/**
 * Detect underused / neglected clothing garments for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Underused items with detailed reasons
 */
const getUnderusedGarments = async (userId) => {
  const allItems = await WardrobeItem.find({ userId });
  if (!allItems || allItems.length === 0) return [];

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const underusedList = [];

  allItems.forEach((item) => {
    const timesWorn = item.timesWorn || 0;
    const lastWorn = item.lastWorn;
    const createdAt = item.createdAt;

    let isUnderused = false;
    let reason = '';

    if (timesWorn === 0) {
      isUnderused = true;
      reason = `This ${item.primaryColor} ${item.type} has never been worn yet.`;
    } else if (timesWorn <= 2 && new Date(createdAt) < thirtyDaysAgo) {
      isUnderused = true;
      reason = `This ${item.type} has been worn only ${timesWorn} time${timesWorn > 1 ? 's' : ''} since added.`;
    } else if (lastWorn && new Date(lastWorn) < thirtyDaysAgo) {
      const days = Math.floor((new Date() - new Date(lastWorn)) / (1000 * 60 * 60 * 24));
      isUnderused = true;
      reason = `Last worn ${days} days ago. Consider styling it with a new pairing.`;
    }

    if (isUnderused) {
      underusedList.push({
        itemId: item._id,
        imageUrl: item.imageUrl,
        category: item.category,
        type: item.type,
        primaryColor: item.primaryColor,
        style: item.style,
        timesWorn: item.timesWorn,
        lastWorn: item.lastWorn,
        createdAt: item.createdAt,
        reason,
      });
    }
  });

  return underusedList;
};

/**
 * Analyze user's existing wardrobe to detect structural gaps (missing categories/styles/colors)
 * @param {Array} items - Array of WardrobeItem documents
 * @returns {Array} List of identified wardrobe gaps
 */
const detectWardrobeGaps = (items = []) => {
  const gaps = [];
  if (!items || items.length === 0) {
    return [
      {
        gap: 'Essential Neutral Top',
        reason: 'Your wardrobe is currently empty. Start by adding a versatile white or black top.',
        priority: 'high',
      },
    ];
  }

  const tops = items.filter((i) => i.category === 'top');
  const bottoms = items.filter((i) => i.category === 'bottom');
  const footwears = items.filter((i) => i.category === 'footwear');
  const dresses = items.filter((i) => i.category === 'dress');

  const formalTops = tops.filter((i) => i.style === 'formal' || i.style === 'smart-casual');
  const formalBottoms = bottoms.filter((i) => i.style === 'formal' || i.style === 'smart-casual');

  // Check 1: Formal Tops vs Formal Bottoms Gap
  if (formalTops.length > 0 && formalBottoms.length === 0) {
    gaps.push({
      gap: 'Neutral Formal Trousers',
      reason: `You have ${formalTops.length} formal top(s) but lack compatible formal bottoms for work or formal occasions.`,
      priority: 'high',
    });
  }

  // Check 2: Footwear Gap
  if (footwears.length === 0 && items.length >= 3) {
    gaps.push({
      gap: 'Versatile Footwear',
      reason: 'You have tops and bottoms cataloged, but no footwear digitized to complete full outfit pairings.',
      priority: 'medium',
    });
  }

  // Check 3: Top to Bottom Ratio
  if (tops.length > 0 && bottoms.length === 0 && dresses.length === 0) {
    gaps.push({
      gap: 'Basic Bottom Garments',
      reason: 'Your closet contains tops but lacks bottoms to complete valid outfit pairings.',
      priority: 'high',
    });
  }

  // Check 4: Neutral Color Anchor Gap
  const neutralItems = items.filter((i) =>
    ['white', 'black', 'navy', 'beige', 'grey', 'cream'].includes((i.primaryColor || '').toLowerCase())
  );

  if (neutralItems.length / items.length < 0.25) {
    gaps.push({
      gap: 'Neutral Color Anchor Pieces',
      reason: 'Less than 25% of your wardrobe consists of neutral color anchors (white, black, navy, beige). Neutrals make styling non-neutral garments much easier.',
      priority: 'medium',
    });
  }

  return gaps;
};

/**
 * Calculates complete Wardrobe Insights & Analytics
 * @param {string} userId - User ID
 */
const getWardrobeInsights = async (userId) => {
  const items = await WardrobeItem.find({ userId });
  const outfits = await Outfit.find({ userId });

  const totalGarments = items.length;

  if (totalGarments === 0) {
    return {
      totalGarments: 0,
      mostWornGarments: [],
      leastWornGarments: [],
      mostUsedColors: [],
      underusedGarments: [],
      outfitRepetition: 0,
      wardrobeUtilizationPercentage: 0,
      wardrobeGaps: detectWardrobeGaps([]),
    };
  }

  // Most & Least Worn
  const sortedByWorn = [...items].sort((a, b) => (b.timesWorn || 0) - (a.timesWorn || 0));
  const mostWornGarments = sortedByWorn.slice(0, 5);
  const leastWornGarments = [...sortedByWorn].reverse().slice(0, 5);

  // Color distribution
  const colorCounts = {};
  items.forEach((item) => {
    const color = item.primaryColor || item.colorFamily || 'other';
    colorCounts[color] = (colorCounts[color] || 0) + 1;
  });

  const mostUsedColors = Object.entries(colorCounts)
    .map(([color, count]) => ({ color, count }))
    .sort((a, b) => b.count - a.count);

  // Underused items
  const underusedGarments = await getUnderusedGarments(userId);

  // Utilization calculation
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const recentlyWornCount = items.filter(
    (item) => (item.timesWorn || 0) > 0 || (item.lastWorn && new Date(item.lastWorn) >= thirtyDaysAgo)
  ).length;

  const wardrobeUtilizationPercentage = parseFloat(
    ((recentlyWornCount / totalGarments) * 100).toFixed(1)
  );

  // Outfit repetition
  const outfitRepetition = outfits.length;

  // Wardrobe Gap Detection
  const wardrobeGaps = detectWardrobeGaps(items);

  return {
    totalGarments,
    mostWornGarments: mostWornGarments.map((i) => ({ id: i._id, type: i.type, primaryColor: i.primaryColor, timesWorn: i.timesWorn, imageUrl: i.imageUrl })),
    leastWornGarments: leastWornGarments.map((i) => ({ id: i._id, type: i.type, primaryColor: i.primaryColor, timesWorn: i.timesWorn, imageUrl: i.imageUrl })),
    mostUsedColors,
    underusedGarmentsCount: underusedGarments.length,
    underusedGarments,
    outfitRepetition,
    wardrobeUtilizationPercentage,
    wardrobeGaps,
  };
};

module.exports = {
  getUnderusedGarments,
  detectWardrobeGaps,
  getWardrobeInsights,
};
