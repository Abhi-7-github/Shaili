/**
 * SHAILI Image Analysis & Metadata Classification Service
 * Analyzes uploaded image filenames, user hints, or parameters and generates
 * category arrays, tag arrays, and short descriptive summaries.
 */

// Category to Tag Mapping Dictionary
const CATEGORY_TAG_MAP = {
  wedding: [
    'marriage',
    'wedding',
    'bride',
    'groom',
    'engagement',
    'reception',
    'ceremony',
    'family',
    'relatives',
    'wedding-dress',
    'celebration',
  ],
  birthday: [
    'birthday',
    'cake',
    'candles',
    'party',
    'celebration',
    'friends',
    'family',
    'gift',
  ],
  party: ['party', 'celebration', 'dance', 'drinks', 'friends', 'music', 'fun', 'nightout'],
  travel: [
    'travel',
    'trip',
    'vacation',
    'journey',
    'tourism',
    'sightseeing',
    'adventure',
  ],
  beach: [
    'beach',
    'sea',
    'ocean',
    'waves',
    'sunset',
    'vacation',
    'sand',
    'coast',
  ],
  family: [
    'family',
    'parents',
    'mother',
    'father',
    'brother',
    'sister',
    'siblings',
    'relatives',
  ],
  friends: [
    'friends',
    'group',
    'classmates',
    'hangout',
    'meetup',
    'outing',
  ],
  college: [
    'college',
    'university',
    'campus',
    'classmates',
    'students',
    'teacher',
    'graduation',
    'hackathon',
    'seminar',
  ],
  sports: [
    'cricket',
    'football',
    'basketball',
    'badminton',
    'tennis',
    'running',
    'match',
    'tournament',
    'team',
  ],
  festival: [
    'festival',
    'celebration',
    'diwali',
    'holi',
    'christmas',
    'eid',
    'pongal',
    'onam',
    'traditional',
    'ceremony',
  ],
  fashion: [
    'fashion',
    'outfit',
    'dress',
    'saree',
    'lehenga',
    'kurta',
    'suit',
    'traditional',
    'western',
    'ethnic',
    'jewellery',
  ],
  food: [
    'food',
    'restaurant',
    'dinner',
    'lunch',
    'breakfast',
    'cafe',
    'dessert',
    'cake',
    'biryani',
    'sweets',
  ],
  nature: [
    'nature',
    'forest',
    'mountain',
    'hills',
    'waterfall',
    'river',
    'lake',
    'sunset',
    'sunrise',
    'flowers',
    'landscape',
  ],
  work: ['work', 'office', 'desk', 'meeting', 'team', 'corporate', 'presentation'],
  graduation: ['graduation', 'degree', 'convocation', 'college', 'achievement', 'cap'],
  pets: ['pets', 'dog', 'cat', 'puppy', 'kitten', 'cute', 'animal'],
  music: ['music', 'concert', 'singing', 'guitar', 'band', 'stage', 'live'],
  events: ['events', 'conference', 'seminar', 'gathering', 'stage', 'show'],
  memories: ['memories', 'nostalgia', 'old-times', 'special', 'throwback'],
  'road-trip': ['road-trip', 'drive', 'car', 'highway', 'travel', 'scenic', 'trip'],
};

const VALID_CATEGORIES = Object.keys(CATEGORY_TAG_MAP);

/**
 * Classify and extract categories, tags, and description for an uploaded image.
 * @param {string} originalName - Original filename
 * @param {string|string[]} [userCategories] - Optional categories supplied by user
 * @param {string|string[]} [userTags] - Optional user tags
 * @param {string} [userDescription] - Optional user description
 * @returns {{ categories: string[], tags: string[], description: string }}
 */
const analyzeImage = async (originalName = '', userCategories = [], userTags = [], userDescription = '') => {
  try {
    const categoriesSet = new Set();
    const tagsSet = new Set();

    // 1. Process User-specified Categories
    const rawCategories = Array.isArray(userCategories)
      ? userCategories
      : typeof userCategories === 'string'
      ? userCategories.split(',')
      : [];

    rawCategories.forEach((cat) => {
      const cleanCat = cat.trim().toLowerCase();
      if (VALID_CATEGORIES.includes(cleanCat)) {
        categoriesSet.add(cleanCat);
      }
    });

    // 2. Extract Categories from Filename heuristics if empty
    const filenameLower = originalName.toLowerCase();
    VALID_CATEGORIES.forEach((cat) => {
      if (filenameLower.includes(cat)) {
        categoriesSet.add(cat);
      }
    });

    // Extra keyword heuristics from filename
    if (filenameLower.includes('marriage') || filenameLower.includes('bride') || filenameLower.includes('groom')) {
      categoriesSet.add('wedding');
    }
    if (filenameLower.includes('bday') || filenameLower.includes('party')) {
      categoriesSet.add('birthday');
      categoriesSet.add('party');
    }
    if (filenameLower.includes('tour') || filenameLower.includes('vacation') || filenameLower.includes('trip')) {
      categoriesSet.add('travel');
    }
    if (filenameLower.includes('sea') || filenameLower.includes('ocean')) {
      categoriesSet.add('beach');
    }

    // Default to uncategorized if none detected
    if (categoriesSet.size === 0) {
      categoriesSet.add('uncategorized');
    }

    const categoriesArray = Array.from(categoriesSet);

    // 3. Generate Tags based on Detected Categories
    categoriesArray.forEach((cat) => {
      if (CATEGORY_TAG_MAP[cat]) {
        CATEGORY_TAG_MAP[cat].forEach((tag) => tagsSet.add(tag));
      }
    });

    // 4. Incorporate User Custom Tags
    const rawTags = Array.isArray(userTags)
      ? userTags
      : typeof userTags === 'string'
      ? userTags.split(',')
      : [];

    rawTags.forEach((t) => {
      const cleanTag = t.trim().toLowerCase();
      if (cleanTag) tagsSet.add(cleanTag);
    });

    const tagsArray = Array.from(tagsSet);

    // 5. Generate Description
    let description = userDescription ? userDescription.trim() : '';
    if (!description) {
      const primaryCat = categoriesArray[0] !== 'uncategorized' ? categoriesArray[0] : 'memory';
      const cleanName = originalName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      description = `Uploaded ${primaryCat} image - ${cleanName || 'Personal Memory'}`;
    }

    return {
      categories: categoriesArray,
      tags: tagsArray,
      description,
    };
  } catch (error) {
    console.error('Image Analysis Error:', error);
    // Safe Fallback on failure
    return {
      categories: ['uncategorized'],
      tags: ['memory', 'photo'],
      description: originalName || 'Personal Memory',
    };
  }
};

module.exports = {
  analyzeImage,
  CATEGORY_TAG_MAP,
  VALID_CATEGORIES,
};
