/**
 * Deterministic Color & Outfit Matching Engine for ShAili
 * Evaluates color compatibility, style harmony, occasion alignment, weather suitability, and user preferences.
 */

// Matrix of known high-harmony color pair scores (0-100)
const COLOR_PAIR_MATRIX = {
  'white-navy': 95,
  'navy-white': 95,
  'white-black': 95,
  'black-white': 95,
  'white-beige': 90,
  'beige-white': 90,
  'black-grey': 90,
  'grey-black': 90,
  'navy-beige': 92,
  'beige-navy': 92,
  'blue-white': 95,
  'white-blue': 95,
  'black-red': 82,
  'red-black': 82,
  'green-beige': 88,
  'beige-green': 88,
  'brown-cream': 92,
  'cream-brown': 92,
  'purple-black': 85,
  'black-purple': 85,
  'white-denim': 95,
  'white-grey': 92,
  'black-beige': 88,
  'burgundy-cream': 92,
  'burgundy-white': 90,
  'olive-cream': 88,
  'pink-white': 88,
};

const NEUTRAL_COLORS = ['white', 'black', 'grey', 'beige', 'cream', 'navy'];

/**
 * Calculates deterministic color compatibility between two garments (e.g., Top & Bottom)
 * @param {object} itemA - First garment
 * @param {object} itemB - Second garment
 * @returns {{ score: number, relationship: string, explanation: string }}
 */
const calculateColorCompatibility = (itemA, itemB) => {
  if (!itemA || !itemB) {
    return { score: 75, relationship: 'neutral', explanation: 'Single garment baseline.' };
  }

  const cA = (itemA.primaryColor || itemA.colorFamily || 'white').toLowerCase();
  const cB = (itemB.primaryColor || itemB.colorFamily || 'black').toLowerCase();

  // 1. Direct Matrix Lookup
  const pairKey = `${cA}-${cB}`;
  if (COLOR_PAIR_MATRIX[pairKey]) {
    const score = COLOR_PAIR_MATRIX[pairKey];
    return {
      score,
      relationship: score >= 90 ? 'excellent' : score >= 80 ? 'harmonious' : 'good',
      explanation: `The ${cA} ${itemA.category || 'top'} creates strong aesthetic contrast with the ${cB} ${itemB.category || 'bottom'}.`,
    };
  }

  // 2. Monochromatic matching (same primary color)
  if (cA === cB) {
    const lightnessDiff = Math.abs((itemA.lightness || 50) - (itemB.lightness || 50));
    if (lightnessDiff >= 20) {
      return {
        score: 88,
        relationship: 'monochromatic contrast',
        explanation: `Tonal pairing of ${cA} with distinct depth and shade contrast.`,
      };
    }
    return {
      score: 82,
      relationship: 'monochromatic',
      explanation: `Clean monochromatic ${cA} combination.`,
    };
  }

  // 3. Neutral + Color matching
  const isANeutral = NEUTRAL_COLORS.includes(cA);
  const isBNeutral = NEUTRAL_COLORS.includes(cB);

  if (isANeutral || isBNeutral) {
    return {
      score: 90,
      relationship: 'neutral pairing',
      explanation: `The neutral ${isANeutral ? cA : cB} anchors the accent ${isANeutral ? cB : cA} effortlessly.`,
    };
  }

  // 4. Hue distance calculation (HSL)
  const hueA = itemA.hue !== undefined ? itemA.hue : 0;
  const hueB = itemB.hue !== undefined ? itemB.hue : 180;
  let hueDiff = Math.abs(hueA - hueB);
  if (hueDiff > 180) hueDiff = 360 - hueDiff;

  // Complementary (150-210 deg)
  if (hueDiff >= 150 && hueDiff <= 210) {
    return {
      score: 88,
      relationship: 'complementary',
      explanation: `High energy complementary color pairing on the color wheel.`,
    };
  }

  // Analogous (20-50 deg)
  if (hueDiff >= 20 && hueDiff <= 50) {
    return {
      score: 85,
      relationship: 'analogous',
      explanation: `Harmonious neighboring colors providing smooth visual flow.`,
    };
  }

  return {
    score: 78,
    relationship: 'moderate contrast',
    explanation: `Balanced color combination with moderate visual contrast.`,
  };
};

/**
 * Calculates Style Compatibility between garments (0-100)
 */
const calculateStyleCompatibility = (itemA, itemB) => {
  if (!itemA || !itemB) return { score: 85, explanation: 'Single style baseline.' };
  const sA = (itemA.style || 'casual').toLowerCase();
  const sB = (itemB.style || 'casual').toLowerCase();

  if (sA === sB) {
    return { score: 95, explanation: `Consistent ${sA} style alignment across garments.` };
  }

  const compatiblePairs = [
    ['casual', 'smart-casual'],
    ['formal', 'smart-casual'],
    ['ethnic', 'traditional'],
    ['casual', 'streetwear'],
    ['casual', 'sporty'],
    ['party', 'smart-casual'],
  ];

  const isCompatible = compatiblePairs.some(
    ([x, y]) => (x === sA && y === sB) || (x === sB && y === sA)
  );

  if (isCompatible) {
    return { score: 88, explanation: `Versatile cross-over between ${sA} and ${sB} styles.` };
  }

  // Formality difference check
  const fA = itemA.formality || 3;
  const fB = itemB.formality || 3;
  const formalityDiff = Math.abs(fA - fB);

  if (formalityDiff <= 1) return { score: 82, explanation: `Balanced formality levels.` };
  if (formalityDiff === 2) return { score: 70, explanation: `Moderate formality contrast.` };
  return { score: 55, explanation: `High contrast in formality index.` };
};

/**
 * Calculates Occasion Compatibility for an outfit
 */
const calculateOccasionCompatibility = (items = [], targetOccasion = 'casual') => {
  if (!items || items.length === 0) return { score: 80, explanation: 'Default occasion baseline.' };
  const target = targetOccasion.toLowerCase();

  let totalMatch = 0;
  items.forEach((item) => {
    const occasions = (item.occasions || []).map((o) => o.toLowerCase());
    if (occasions.includes(target)) {
      totalMatch += 1;
    } else if (item.style === target || (target === 'college' && item.style === 'casual')) {
      totalMatch += 0.8;
    } else {
      totalMatch += 0.5;
    }
  });

  const avgMatch = totalMatch / items.length;
  const score = Math.round(avgMatch * 100);

  return {
    score: Math.min(100, Math.max(50, score)),
    explanation: `Outfit aligns well with ${target} dress code standards.`,
  };
};

/**
 * Calculates Weather Compatibility for an outfit
 */
const calculateWeatherCompatibility = (items = [], weather = { temperature: 25, condition: 'sunny' }) => {
  if (!items || items.length === 0) return { score: 85, explanation: 'Standard weather alignment.' };
  const temp = weather.temperature || 25;

  let seasonTarget = 'summer';
  if (temp < 18) seasonTarget = 'winter';
  else if (weather.condition === 'rainy' || weather.condition === 'monsoon') seasonTarget = 'monsoon';

  let totalMatch = 0;
  items.forEach((item) => {
    const seasons = (item.seasons || []).map((s) => s.toLowerCase());
    if (seasons.includes(seasonTarget)) {
      totalMatch += 1;
    } else {
      totalMatch += 0.6;
    }
  });

  const score = Math.round((totalMatch / items.length) * 100);
  return {
    score: Math.min(100, Math.max(60, score)),
    explanation: `Garments selected provide comfort for ${temp}°C ${seasonTarget} climate conditions.`,
  };
};

/**
 * Calculates User Preference Compatibility
 */
const calculatePreferenceCompatibility = (items = [], preferences = {}) => {
  if (!items || items.length === 0) return { score: 85, explanation: 'Default preference baseline.' };
  const preferredColors = (preferences.preferredColors || []).map((c) => c.toLowerCase());
  const avoidColors = (preferences.avoidColors || []).map((c) => c.toLowerCase());

  let penalty = 0;
  let bonus = 0;

  items.forEach((item) => {
    const color = (item.primaryColor || '').toLowerCase();
    if (avoidColors.includes(color)) penalty += 30;
    if (preferredColors.includes(color)) bonus += 15;
  });

  const baseScore = 85 + bonus - penalty;
  const score = Math.min(100, Math.max(40, baseScore));

  return {
    score,
    explanation: penalty > 0 ? 'Includes colors near user preference limits.' : 'Matches user personal color preferences.',
  };
};

/**
 * Dynamically computes total weighted Outfit Compatibility Score:
 * Color (35%) + Style (25%) + Occasion (20%) + Weather (10%) + User Preference (10%)
 * @param {Array} items - Garment objects in outfit
 * @param {object} context - { occasion, style, weather, preferences }
 * @returns {{ finalScore: number, colorScore: number, styleScore: number, occasionScore: number, weatherScore: number, preferenceScore: number, breakdown: object }}
 */
const calculateOutfitScore = (items = [], context = {}) => {
  const top = items.find((i) => i.category === 'top' || i.category === 'dress');
  const bottom = items.find((i) => i.category === 'bottom');

  const colorRes = calculateColorCompatibility(top, bottom);
  const styleRes = calculateStyleCompatibility(top, bottom);
  const occasionRes = calculateOccasionCompatibility(items, context.occasion || 'casual');
  const weatherRes = calculateWeatherCompatibility(items, context.weather || { temperature: 25, condition: 'sunny' });
  const preferenceRes = calculatePreferenceCompatibility(items, context.preferences || {});

  const colorScore = colorRes.score;
  const styleScore = styleRes.score;
  const occasionScore = occasionRes.score;
  const weatherScore = weatherRes.score;
  const preferenceScore = preferenceRes.score;

  // Exact 5-part weighted dynamic formula
  const rawScore =
    colorScore * 0.35 +
    styleScore * 0.25 +
    occasionScore * 0.20 +
    weatherScore * 0.10 +
    preferenceScore * 0.10;

  const finalScore = parseFloat(rawScore.toFixed(1));

  return {
    finalScore,
    colorScore,
    styleScore,
    occasionScore,
    weatherScore,
    preferenceScore,
    breakdown: {
      color: colorRes,
      style: styleRes,
      occasion: occasionRes,
      weather: weatherRes,
      preference: preferenceRes,
    },
  };
};

module.exports = {
  COLOR_PAIR_MATRIX,
  calculateColorCompatibility,
  calculateStyleCompatibility,
  calculateOccasionCompatibility,
  calculateWeatherCompatibility,
  calculatePreferenceCompatibility,
  calculateOutfitScore,
};
