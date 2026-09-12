const WardrobeItem = require('../models/WardrobeItem');
const { calculateOutfitScore } = require('./matching.service');
const { GoogleGenAI } = require('@google/genai');

let aiClient = null;
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' && geminiApiKey !== 'your_ai_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (e) {
    console.warn('Gemini client init warning in stylist.service:', e.message);
  }
}

/**
 * Generate stylized outfits from user's actual MongoDB wardrobe items
 * @param {object} params - { userId, occasion, style, weather, preferences }
 * @returns {Promise<Array>} Ranked Outfits with breakdown & explanations
 */
const generateStylistOutfits = async ({
  userId,
  occasion = 'casual',
  style = 'casual',
  weather = { temperature: 25, condition: 'sunny' },
  preferences = { preferredColors: [], avoidColors: [], preferredStyles: [] },
}) => {
  // 1. Retrieve the user's actual wardrobe items from MongoDB
  const wardrobeItems = await WardrobeItem.find({ userId });

  if (!wardrobeItems || wardrobeItems.length === 0) {
    return [];
  }

  // 2. Filter out inappropriate garments (e.g., avoided colors)
  const avoidColors = (preferences.avoidColors || []).map((c) => c.toLowerCase());
  const eligibleItems = wardrobeItems.filter((item) => {
    const color = (item.primaryColor || '').toLowerCase();
    return !avoidColors.includes(color);
  });

  const itemsToUse = eligibleItems.length > 0 ? eligibleItems : wardrobeItems;

  // Separate garments by category
  const tops = itemsToUse.filter((i) => i.category === 'top');
  const bottoms = itemsToUse.filter((i) => i.category === 'bottom');
  const dresses = itemsToUse.filter((i) => i.category === 'dress');
  const footwears = itemsToUse.filter((i) => i.category === 'footwear');
  const outerwears = itemsToUse.filter((i) => i.category === 'outerwear');
  const accessories = itemsToUse.filter((i) => i.category === 'accessory');

  const candidateCombinations = [];

  // Form Top + Bottom combinations
  tops.forEach((top) => {
    bottoms.forEach((bottom) => {
      const combo = [top, bottom];
      if (footwears.length > 0) combo.push(footwears[0]);
      if (outerwears.length > 0 && (weather.temperature < 20 || style === 'formal')) combo.push(outerwears[0]);
      if (accessories.length > 0) combo.push(accessories[0]);
      candidateCombinations.push(combo);
    });
  });

  // Form Dress combinations
  dresses.forEach((dress) => {
    const combo = [dress];
    if (footwears.length > 0) combo.push(footwears[0]);
    if (outerwears.length > 0) combo.push(outerwears[0]);
    candidateCombinations.push(combo);
  });

  if (candidateCombinations.length === 0 && wardrobeItems.length > 0) {
    // If no complete top+bottom or dress, return whatever items exist
    candidateCombinations.push(wardrobeItems.slice(0, 3));
  }

  // 3. Score and rank each outfit combination dynamically
  const context = { occasion, style, weather, preferences };

  const scoredOutfits = candidateCombinations.map((items) => {
    const scoreResult = calculateOutfitScore(items, context);

    const itemTitles = items.map((i) => `${i.primaryColor} ${i.type}`).join(', ');
    const defaultExplanation = `A ${scoreResult.breakdown.color.relationship} combination featuring ${itemTitles}, perfectly aligned for ${occasion}.`;

    return {
      items: items.map((i) => ({
        id: i._id,
        imageUrl: i.imageUrl,
        category: i.category,
        type: i.type,
        primaryColor: i.primaryColor,
        colorFamily: i.colorFamily,
        style: i.style,
        formality: i.formality,
      })),
      score: scoreResult.finalScore,
      colorScore: scoreResult.colorScore,
      styleScore: scoreResult.styleScore,
      occasionScore: scoreResult.occasionScore,
      weatherScore: scoreResult.weatherScore,
      preferenceScore: scoreResult.preferenceScore,
      explanation: defaultExplanation,
      whyItWorks: [
        scoreResult.breakdown.color.explanation,
        scoreResult.breakdown.style.explanation,
        scoreResult.breakdown.occasion.explanation,
      ],
    };
  });

  // 4. Sort combinations by score descending
  scoredOutfits.sort((a, b) => b.score - a.score);

  // Pick top 5 unique outfits
  const topOutfits = scoredOutfits.slice(0, 5);

  // 5. Optionally refine top outfit explanations via AI if available
  const client = aiClient || (process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null);

  if (client && topOutfits.length > 0) {
    try {
      const topOutfitSummary = topOutfits[0].items
        .map((i) => `${i.primaryColor} ${i.type} (${i.category})`)
        .join(' + ');

      const prompt = `As a personal fashion stylist, write a 2-sentence explanation of why combining [${topOutfitSummary}] works well for a ${occasion} event in ${weather.temperature}°C weather. Be elegant and concise. Do not mention items not in the list.`;

      const response = await client.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      });

      if (response && response.text) {
        topOutfits[0].explanation = response.text.trim();
      }
    } catch (aiErr) {
      console.warn('Stylist AI explanation warning:', aiErr.message);
    }
  }

  return topOutfits;
};

module.exports = {
  generateStylistOutfits,
};
