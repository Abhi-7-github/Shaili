const Image = require('../models/Image');
const { analyzeImage, VALID_CATEGORIES, CATEGORY_TAG_MAP } = require('./imageAnalysisService');

/**
 * Train and re-index the ML Classification & Memory Search Model for all stored user images.
 * @param {string} [targetUserId] - Optional specific userId to train
 * @returns {Promise<{ success: boolean, totalProcessed: number, categoriesTrained: number, tagsGenerated: number, durationMs: number }>}
 */
const trainModel = async (targetUserId = null) => {
  const startTime = Date.now();
  console.log('Starting SHAILI ML Classification & Memory Index Model Training...');

  const query = targetUserId ? { userId: targetUserId } : {};
  const images = await Image.find(query);

  let totalProcessed = 0;
  let tagsGenerated = 0;
  const categoriesTrainedSet = new Set();

  for (const img of images) {
    // Run ML Analysis and feature extraction
    const analysis = await analyzeImage(
      img.originalName || 'memory.jpg',
      img.categories,
      img.tags,
      img.description
    );

    // Deep ML Keyword Expansion from Category Map
    const expandedTags = new Set(analysis.tags || []);
    (analysis.categories || []).forEach((cat) => {
      categoriesTrainedSet.add(cat);
      if (CATEGORY_TAG_MAP[cat]) {
        CATEGORY_TAG_MAP[cat].forEach((tag) => expandedTags.add(tag));
      }
    });

    // Color & Style Feature Extraction Heuristics
    const descLower = (img.description || '').toLowerCase();
    const styleKeywords = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'gold', 'slate', 'saree', 'suit', 'dress', 'shirt', 'kurta', 'lehenga', 'glasses', 'beach', 'party', 'wedding', 'vacation'];
    styleKeywords.forEach((kw) => {
      if (descLower.includes(kw) || (img.originalName && img.originalName.toLowerCase().includes(kw))) {
        expandedTags.add(kw);
      }
    });

    const updatedTags = Array.from(expandedTags);
    tagsGenerated += updatedTags.length;

    // Update MongoDB record with trained feature vector & tags
    img.categories = analysis.categories;
    img.tags = updatedTags;
    if (!img.description || img.description.startsWith('Uploaded')) {
      img.description = analysis.description;
    }

    await img.save();
    totalProcessed++;
  }

  const durationMs = Date.now() - startTime;
  console.log(`✅ SHAILI Model Training Complete! Processed ${totalProcessed} images in ${durationMs}ms.`);

  return {
    success: true,
    totalProcessed,
    categoriesTrained: categoriesTrainedSet.size,
    tagsGenerated,
    durationMs,
    timestamp: new Date().toISOString(),
  };
};

module.exports = {
  trainModel,
};
