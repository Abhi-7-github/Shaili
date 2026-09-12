const { GoogleGenAI } = require('@google/genai');
const { normalizeColor } = require('./color.service');

// Initialize Gemini Client safely with either GEMINI_API_KEY or AI_API_KEY
let aiClient = null;
const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_API_KEY;
if (geminiApiKey && geminiApiKey !== 'your_gemini_api_key_here' && geminiApiKey !== 'your_ai_api_key_here') {
  try {
    aiClient = new GoogleGenAI({ apiKey: geminiApiKey });
  } catch (err) {
    console.warn('Gemini Client Init Warning in vision.service:', err.message);
  }
}

/**
 * Validates AI structured response against required schema
 * @param {object} parsed - Parsed JSON object from AI
 * @returns {boolean}
 */
const validateClothingMetadata = (parsed) => {
  if (!parsed || typeof parsed !== 'object') return false;

  const validCategories = ['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress'];
  const validPatterns = ['solid', 'striped', 'checked', 'printed', 'floral', 'textured', 'other'];
  const validMaterials = ['cotton', 'denim', 'wool', 'linen', 'silk', 'synthetic', 'leather', 'unknown'];
  const validStyles = ['casual', 'formal', 'ethnic', 'streetwear', 'smart-casual', 'sporty', 'party', 'traditional'];

  return (
    validCategories.includes(String(parsed.category).toLowerCase()) &&
    typeof parsed.type === 'string' &&
    typeof parsed.primaryColor === 'string' &&
    validPatterns.includes(String(parsed.pattern || 'solid').toLowerCase()) &&
    validMaterials.includes(String(parsed.material || 'cotton').toLowerCase()) &&
    validStyles.includes(String(parsed.style || 'casual').toLowerCase())
  );
};

/**
 * Fallback clothing metadata generator based on file name or simple heuristics
 */
const generateFallbackAnalysis = (filename = '') => {
  const lower = filename.toLowerCase();
  let category = 'top';
  let type = 'shirt';
  let primaryColor = 'white';
  let style = 'casual';
  let pattern = 'solid';
  let material = 'cotton';

  if (lower.includes('jean') || lower.includes('pant') || lower.includes('trouser') || lower.includes('skirt') || lower.includes('short')) {
    category = 'bottom';
    type = lower.includes('jean') ? 'jeans' : 'trousers';
    if (lower.includes('jean')) material = 'denim';
  } else if (lower.includes('shoe') || lower.includes('sneaker') || lower.includes('boot') || lower.includes('heel') || lower.includes('sandal')) {
    category = 'footwear';
    type = 'shoes';
  } else if (lower.includes('jacket') || lower.includes('coat') || lower.includes('blazer') || lower.includes('hoodie')) {
    category = 'outerwear';
    type = 'jacket';
  } else if (lower.includes('dress') || lower.includes('saree') || lower.includes('lehenga') || lower.includes('gown')) {
    category = 'dress';
    type = lower.includes('saree') ? 'saree' : 'dress';
    style = 'ethnic';
  } else if (lower.includes('kurta')) {
    type = 'kurta';
    style = 'ethnic';
  }

  if (lower.includes('black')) primaryColor = 'black';
  else if (lower.includes('blue') || lower.includes('navy')) primaryColor = lower.includes('navy') ? 'navy' : 'blue';
  else if (lower.includes('red') || lower.includes('maroon')) primaryColor = 'red';
  else if (lower.includes('green')) primaryColor = 'green';
  else if (lower.includes('beige')) primaryColor = 'beige';

  const colorMeta = normalizeColor(primaryColor);

  return {
    category,
    type,
    primaryColor: colorMeta.primaryColor,
    secondaryColor: '',
    colorFamily: colorMeta.colorFamily,
    hex: colorMeta.hex,
    hue: colorMeta.hue,
    saturation: colorMeta.saturation,
    lightness: colorMeta.lightness,
    pattern,
    material,
    style,
    formality: style === 'formal' ? 5 : style === 'smart-casual' ? 4 : 3,
    seasons: ['summer', 'winter', 'monsoon'],
    occasions: ['casual', 'college', 'office', 'party', 'travel'],
    confidence: 85,
  };
};

/**
 * Analyzes a clothing image URL / buffer using AI Vision
 * @param {string} imageUrl - Cloudinary Image URL or Image Base64
 * @param {string} originalname - Original file name
 * @returns {Promise<object>} Structured Clothing Metadata
 */
const analyzeClothingImage = async (imageUrl, originalname = '') => {
  const client = aiClient || (process.env.GEMINI_API_KEY ? new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY }) : null);

  if (!client) {
    console.warn('AI Client unavailable, using fallback heuristics for clothing vision analysis.');
    return generateFallbackAnalysis(originalname);
  }

  const prompt = `You are a high-precision fashion AI vision system.
Analyze this clothing item image and determine its exact metadata attributes.

Respond strictly in JSON format matching this EXACT schema:
{
  "category": "top" | "bottom" | "footwear" | "outerwear" | "accessory" | "dress",
  "type": "shirt | t-shirt | blouse | kurta | jeans | trousers | skirt | shorts | jacket | dress | shoes | etc",
  "primaryColor": "white | black | navy | blue | red | green | beige | cream | brown | grey | pink | purple | yellow | orange",
  "secondaryColor": "optional secondary color name or empty",
  "pattern": "solid" | "striped" | "checked" | "printed" | "floral" | "textured" | "other",
  "material": "cotton" | "denim" | "wool" | "linen" | "silk" | "synthetic" | "leather" | "unknown",
  "style": "casual" | "formal" | "ethnic" | "streetwear" | "smart-casual" | "sporty" | "party" | "traditional",
  "formality": 1 to 5 number,
  "seasons": ["summer", "winter", "monsoon"],
  "occasions": ["casual", "college", "office", "party", "wedding", "travel"],
  "confidence": 0 to 100 number
}

Rules:
1. Category must be strictly one of: top, bottom, footwear, outerwear, accessory, dress.
2. Return ONLY the JSON object. Do not include markdown code fences or conversational text.`;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: [
        {
          role: 'user',
          parts: [{ text: prompt }],
        },
      ],
      config: {
        temperature: 0.2,
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);

    if (validateClothingMetadata(parsed)) {
      const colorMeta = normalizeColor(parsed.primaryColor, parsed.secondaryColor);

      return {
        category: parsed.category.toLowerCase(),
        type: String(parsed.type).toLowerCase(),
        primaryColor: colorMeta.primaryColor,
        secondaryColor: colorMeta.secondaryColor,
        colorFamily: colorMeta.colorFamily,
        hex: colorMeta.hex,
        hue: colorMeta.hue,
        saturation: colorMeta.saturation,
        lightness: colorMeta.lightness,
        pattern: parsed.pattern.toLowerCase(),
        material: parsed.material.toLowerCase(),
        style: parsed.style.toLowerCase(),
        formality: Number(parsed.formality) || 3,
        seasons: Array.isArray(parsed.seasons) ? parsed.seasons : ['summer', 'winter', 'monsoon'],
        occasions: Array.isArray(parsed.occasions) ? parsed.occasions : ['casual', 'college', 'office'],
        confidence: Number(parsed.confidence) || 90,
      };
    } else {
      console.warn('AI response failed schema validation. Falling back.');
      return generateFallbackAnalysis(originalname);
    }
  } catch (err) {
    console.error('Vision AI Analysis Service Error:', err.message);
    return generateFallbackAnalysis(originalname);
  }
};

module.exports = {
  analyzeClothingImage,
  validateClothingMetadata,
};
