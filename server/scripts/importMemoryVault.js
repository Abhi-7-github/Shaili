require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Image = require('../models/Image');
const User = require('../models/User');
const { uploadToCloudinary } = require('../services/cloudinaryService');

const SEED_SOURCE = 'memory-vault-bulk-import';
const CONCURRENCY_LIMIT = 5;

// Valid categories mapping
const VALID_CATEGORIES = new Set([
  'wedding', 'birthday', 'party', 'travel', 'family', 'friends',
  'college', 'sports', 'festival', 'fashion', 'food', 'nature',
  'work', 'graduation', 'pets', 'music', 'events', 'memories',
  'road-trip', 'beach'
]);

// Basic tag generation based on category
const generateTagsForCategory = (category) => {
  const tagsMap = {
    'wedding': ['wedding', 'indian-wedding', 'traditional', 'celebration'],
    'family': ['family', 'indian-family', 'gathering'],
    'beach': ['beach', 'india', 'travel', 'vacation'],
    'festival': ['festival', 'india', 'traditional', 'celebration'],
    'college': ['college', 'students', 'campus', 'india'],
    'food': ['food', 'indian-food', 'cuisine'],
    'travel': ['travel', 'india', 'vacation'],
    'road-trip': ['road-trip', 'travel', 'india', 'journey'],
    'fashion': ['fashion', 'indian-fashion', 'traditional']
  };
  return tagsMap[category] || [category, 'india', 'memory'];
};

const getSupportedFiles = (dirPath) => {
  const supportedExts = new Set(['.jpg', '.jpeg', '.png', '.webp']);
  let results = [];
  
  if (!fs.existsSync(dirPath)) return results;

  const items = fs.readdirSync(dirPath);
  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      results = results.concat(getSupportedFiles(fullPath));
    } else {
      const ext = path.extname(item).toLowerCase();
      if (supportedExts.has(ext)) {
        // Find category from parent directory name
        const parentDirName = path.basename(path.dirname(fullPath)).toLowerCase();
        
        let category = parentDirName;
        if (!VALID_CATEGORIES.has(category)) {
          category = 'uncategorized';
        }

        results.push({
          fullPath,
          filename: item,
          category,
          size: stat.size
        });
      }
    }
  }
  return results;
};

async function processImage(fileData, seedUserId, stats) {
  const { fullPath, filename, category, size } = fileData;
  const seedKey = `import-${category}-${filename}`;

  try {
    // 1. Idempotency check
    const existing = await Image.findOne({ userId: seedUserId, seedKey });
    if (existing) {
      stats.skipped++;
      console.log(`  [SKIPPED] ${filename} (already exists)`);
      return;
    }

    // 2. Read file to buffer
    // Skip files larger than 10MB as a safety precaution
    if (size > 10 * 1024 * 1024) {
      stats.failed++;
      console.log(`  [FAILED] ${filename} (exceeds 10MB limit)`);
      return;
    }
    
    const buffer = fs.readFileSync(fullPath);

    // 3. Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(buffer, seedUserId, filename);
    
    // 4. Create MongoDB Record
    await Image.create({
      userId: seedUserId,
      cloudinaryPublicId: uploadResult.publicId,
      cloudinaryUrl: uploadResult.secureUrl,
      originalName: filename,
      categories: [category],
      tags: generateTagsForCategory(category),
      description: `Bulk imported memory from ${category} dataset.`,
      gender: 'unisex', // Conservative default for backend import
      seedSource: SEED_SOURCE,
      seedKey: seedKey
    });

    stats.created++;
    stats.categories[category] = (stats.categories[category] || 0) + 1;
    console.log(`  [✓] ${filename} -> ${category}`);

  } catch (error) {
    stats.failed++;
    console.log(`  [FAILED] ${filename}: ${error.message}`);
  }
}

async function runImport() {
  const datasetPath = process.argv[2] || process.env.MEMORY_DATASET_PATH;
  const seedUserId = process.env.SEED_USER_ID;

  if (!datasetPath) {
    console.error('\nERROR: Dataset path is missing.');
    console.error('Usage: npm run import:memories -- "C:\\path\\to\\MemoryDataset"');
    console.error('Or set MEMORY_DATASET_PATH environment variable.\n');
    process.exit(1);
  }

  if (!seedUserId) {
    console.error('\nERROR: SEED_USER_ID environment variable is missing.');
    console.error('The import script must safely assign images to a specific user.');
    console.error('Please run the script with: SEED_USER_ID=<your_user_id> npm run import:memories -- "C:\\path\\to\\dataset"\n');
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const user = await User.findById(seedUserId);
    if (!user) {
      console.error(`\nERROR: User not found for ID: ${seedUserId}\n`);
      process.exit(1);
    }

    console.log('\n=======================================');
    console.log('MEMORY VAULT BULK IMPORT');
    console.log('=======================================');
    console.log(`Target User: ${user.email}`);
    console.log(`Dataset Path: ${datasetPath}\n`);

    const filesToProcess = getSupportedFiles(datasetPath);
    
    if (filesToProcess.length === 0) {
      console.log('No supported images found in the dataset directory.');
      process.exit(0);
    }

    console.log(`Found ${filesToProcess.length} images to process.\n`);

    const stats = {
      created: 0,
      skipped: 0,
      failed: 0,
      categories: {}
    };

    // Process files with controlled concurrency
    for (let i = 0; i < filesToProcess.length; i += CONCURRENCY_LIMIT) {
      const chunk = filesToProcess.slice(i, i + CONCURRENCY_LIMIT);
      await Promise.all(chunk.map(file => processImage(file, seedUserId, stats)));
    }

    console.log('\n=======================================');
    console.log('IMPORT SUMMARY');
    console.log('=======================================');
    
    for (const cat of VALID_CATEGORIES) {
      const count = stats.categories[cat] || 0;
      console.log(`${cat.padEnd(15)} ${count}`);
    }
    
    console.log('\n---------------------------------------');
    console.log(`Total Found:   ${filesToProcess.length}`);
    console.log(`Created:       ${stats.created}`);
    console.log(`Skipped:       ${stats.skipped}`);
    console.log(`Failed:        ${stats.failed}`);
    console.log('=======================================\n');

  } catch (error) {
    console.error('Fatal Error during import:', error.message);
  } finally {
    mongoose.disconnect();
  }
}

runImport();
