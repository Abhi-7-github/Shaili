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

  // If specific categories are detected, ONLY search within those categories
  if (categories.length > 0) {
    baseQuery.categories = { $in: categories };
  }

  // Keyword search conditions across tags, description, etc.
  let searchConditions = [];

  keywords.forEach((kw) => {
    const regex = new RegExp(kw, 'i');
    searchConditions.push({ categories: regex });
    searchConditions.push({ tags: regex });
    searchConditions.push({ description: regex });
    searchConditions.push({ originalName: regex });
  });

  if (rawQuery && searchConditions.length === 0) {
    const rawRegex = new RegExp(rawQuery.replace(/[^a-zA-Z0-9\s]/g, ''), 'i');
    searchConditions.push({ categories: rawRegex });
    searchConditions.push({ tags: rawRegex });
    searchConditions.push({ description: rawRegex });
  }

  if (searchConditions.length > 0) {
    baseQuery.$or = searchConditions;
  }

  // Retrieve user's matching images from MongoDB
  const images = await Image.find(baseQuery).lean();

  // Relevance Scoring & Ranking System
  // Rank 1: Exact category match
  // Rank 2: Tag match
  // Rank 3: Description match
  // Rank 4: Partial keyword match
  const scoredImages = images.map((img) => {
    let score = 0;

    const imgCategories = (img.categories || []).map((c) => c.toLowerCase());
    const imgTags = (img.tags || []).map((t) => t.toLowerCase());
    const imgDesc = (img.description || '').toLowerCase();

    // Score Category Matches (Highest weight)
    categories.forEach((cat) => {
      if (imgCategories.includes(cat.toLowerCase())) {
        score += 50;
      }
    });

    // Score Keyword & Tag Matches
    keywords.forEach((kw) => {
      const kwLower = kw.toLowerCase();
      
      // Tag match
      if (imgTags.includes(kwLower)) {
        score += 30;
      } else if (imgTags.some((t) => t.includes(kwLower))) {
        score += 15;
      }

      // Category text match
      if (imgCategories.some((c) => c.includes(kwLower))) {
        score += 25;
      }

      // Description text match
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
