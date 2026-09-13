const Image = require('../models/Image');

/**
 * Perform relevance-ranked search on images strictly belonging to the authenticated user.
 * @param {string|Object} userId - Authenticated user ObjectId
 * @param {{ categories: string[], keywords: string[] }} parsedCriteria - Structured search criteria
 * @param {string} rawQuery - Original query string
 * @returns {Promise<Array>} - Array of matching image documents ranked by relevance score
 */
const searchUserImages = async (userId, parsedCriteria, rawQuery = '') => {
  if (!userId) {
    throw new Error('User ID is required for image search');
  }

  const { categories = [], keywords = [] } = parsedCriteria;

  // Base Query: Strictly scoped to authenticated userId
  const baseQuery = { userId };

  // Keyword & Category search conditions across categories, tags, description, originalName
  let searchConditions = [];

  // 1. Categories regex conditions
  categories.forEach((cat) => {
    const regex = new RegExp(cat, 'i');
    searchConditions.push({ categories: regex });
    searchConditions.push({ tags: regex });
    searchConditions.push({ description: regex });
  });

  // 2. Keyword regex conditions
  keywords.forEach((kw) => {
    const regex = new RegExp(kw, 'i');
    searchConditions.push({ categories: regex });
    searchConditions.push({ tags: regex });
    searchConditions.push({ description: regex });
    searchConditions.push({ originalName: regex });
  });

  // 3. Raw query fallback search condition
  if (rawQuery) {
    const sanitized = rawQuery.replace(/[^a-zA-Z0-9\u0C00-\u0C7F\u0B80-\u0BFF\u0900-\u097F\s]/g, '').trim();
    if (sanitized) {
      const rawRegex = new RegExp(sanitized, 'i');
      searchConditions.push({ categories: rawRegex });
      searchConditions.push({ tags: rawRegex });
      searchConditions.push({ description: rawRegex });
      searchConditions.push({ originalName: rawRegex });
    }
  }

  if (searchConditions.length > 0) {
    baseQuery.$or = searchConditions;
  }

  // Retrieve user's matching images from MongoDB
  const images = await Image.find(baseQuery).lean();

  // Relevance Scoring & Ranking System
  // Rank 1: Category or Filename match
  // Rank 2: Tag match
  // Rank 3: Description match
  const scoredImages = images.map((img) => {
    let score = 0;

    const imgCategories = (img.categories || []).map((c) => c.toLowerCase());
    const imgTags = (img.tags || []).map((t) => t.toLowerCase());
    const imgDesc = (img.description || '').toLowerCase();
    const imgName = (img.originalName || '').toLowerCase();

    // Score Category Matches
    categories.forEach((cat) => {
      const catLower = cat.toLowerCase();
      if (imgCategories.includes(catLower)) {
        score += 50;
      } else if (imgCategories.some((c) => c.includes(catLower))) {
        score += 25;
      }
    });

    // Score Keyword & Filename Matches
    keywords.forEach((kw) => {
      const kwLower = kw.toLowerCase();
      
      if (imgName.includes(kwLower)) {
        score += 35;
      }

      if (imgTags.includes(kwLower)) {
        score += 30;
      } else if (imgTags.some((t) => t.includes(kwLower))) {
        score += 15;
      }

      if (imgCategories.some((c) => c.includes(kwLower))) {
        score += 25;
      }

      if (imgDesc.includes(kwLower)) {
        score += 20;
      }
    });

    // Recency boost (slight weight for newer uploads)
    const ageInDays = (Date.now() - new Date(img.uploadedAt).getTime()) / (1000 * 60 * 60 * 24);
    if (ageInDays < 7) {
      score += 5;
    }

    return {
      ...img,
      score,
    };
  });

  // Sort by score descending (most relevant first), then by uploadedAt descending
  scoredImages.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return new Date(b.uploadedAt) - new Date(a.uploadedAt);
  });

  return scoredImages;
};

module.exports = {
  searchUserImages,
};
