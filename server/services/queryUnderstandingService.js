const { OpenAI } = require('openai');
const { VALID_CATEGORIES } = require('./imageAnalysisService');

let openaiClient = null;
if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
  try {
    openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  } catch (err) {
    console.warn('OpenAI client initialization failed, falling back to local ML keyword tokenizer:', err.message);
  }
}

/**
 * Local NLP & Dictionary-based keyword tokenizer
 */
const parseQueryLocal = (queryString = '') => {
  if (!queryString || typeof queryString !== 'string') {
    return { categories: [], keywords: [] };
  }

  const queryLower = queryString.toLowerCase().trim();
  const categoriesSet = new Set();
  const keywordsSet = new Set();

  const CONCEPT_DICTIONARY = {
    wedding: ['wedding', 'marriage', 'bride', 'groom', 'reception', 'engagement', 'ceremony', 'sangeet', 'shaadi'],
    birthday: ['birthday', 'bday', 'cake', 'candles', 'party'],
    party: ['party', 'nightout', 'club', 'celebration', 'drinks'],
    travel: ['travel', 'trip', 'vacation', 'tour', 'journey', 'sightseeing', 'holiday', 'adventure'],
    beach: ['beach', 'sea', 'ocean', 'waves', 'sunset', 'sand', 'coastal'],
    family: ['family', 'parents', 'mom', 'mother', 'dad', 'father', 'sister', 'brother', 'siblings', 'relatives'],
    friends: ['friends', 'friend', 'besties', 'buddy', 'buddies', 'group', 'hangout', 'meetup', 'outing'],
    college: ['college', 'university', 'campus', 'hostel', 'classmates', 'students', 'seminar', 'hackathon'],
    sports: ['sports', 'cricket', 'football', 'soccer', 'basketball', 'badminton', 'match', 'tournament'],
    festival: ['festival', 'festive', 'diwali', 'holi', 'christmas', 'eid', 'pongal', 'onam', 'traditional'],
    fashion: ['fashion', 'outfit', 'dress', 'saree', 'lehenga', 'kurta', 'suit', 'ethnic', 'jewellery'],
    food: ['food', 'restaurant', 'dinner', 'lunch', 'breakfast', 'cafe', 'dessert', 'biryani'],
    nature: ['nature', 'forest', 'mountain', 'hills', 'waterfall', 'river', 'lake', 'scenery', 'landscape'],
    work: ['work', 'office', 'desk', 'corporate', 'meeting'],
    graduation: ['graduation', 'convocation', 'degree'],
    pets: ['pets', 'pet', 'dog', 'cat', 'puppy', 'kitten'],
    music: ['music', 'concert', 'gig', 'band', 'song'],
    events: ['events', 'event', 'conference', 'expo'],
    memories: ['memories', 'memory', 'throwback', 'nostalgia', 'old'],
    'road-trip': ['roadtrip', 'road-trip', 'drive', 'car', 'highway'],
  };

  Object.keys(CONCEPT_DICTIONARY).forEach((cat) => {
    const terms = CONCEPT_DICTIONARY[cat];
    terms.forEach((term) => {
      if (queryLower.includes(term)) {
        categoriesSet.add(cat);
        keywordsSet.add(term);
      }
    });
  });

  VALID_CATEGORIES.forEach((cat) => {
    if (queryLower.includes(cat)) {
      categoriesSet.add(cat);
      keywordsSet.add(cat);
    }
  });

  const stopWords = new Set(['show', 'me', 'my', 'find', 'get', 'photos', 'photo', 'pictures', 'picture', 'images', 'image', 'the', 'a', 'an', 'of', 'in', 'at', 'with', 'from', 'for', 'all', 'some', 'look']);
  const words = queryLower.split(/[^a-z0-9\-']+/);

  words.forEach((word) => {
    const clean = word.replace(/'s$/, '').trim();
    if (clean && clean.length > 2 && !stopWords.has(clean)) {
      keywordsSet.add(clean);
    }
  });

  return {
    categories: Array.from(categoriesSet),
    keywords: Array.from(keywordsSet),
  };
};

/**
 * Uses OpenAI GPT model to analyze user query and extract keywords/categories with ML fallback
 */
const parseQuery = async (queryString = '') => {
  if (!queryString || typeof queryString !== 'string') {
    return { categories: [], keywords: [] };
  }

  if (openaiClient || (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here')) {
    try {
      const client = openaiClient || new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
      const prompt = `Analyze this user query for an image memory retrieval system: "${queryString}". Extract key categories and keywords for image search. Return JSON ONLY in this format: {"categories": ["cat1"], "keywords": ["kw1"]}`;

      const response = await client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.2,
      });

      const parsed = JSON.parse(response.choices[0].message.content);
      if (parsed && Array.isArray(parsed.keywords)) {
        return {
          categories: parsed.categories || [],
          keywords: parsed.keywords || [],
        };
      }
    } catch (err) {
      console.warn('OpenAI parseQuery call failed, using local NLP fallback:', err.message);
    }
  }

  return parseQueryLocal(queryString);
};

module.exports = {
  parseQuery,
  parseQueryLocal,
};

