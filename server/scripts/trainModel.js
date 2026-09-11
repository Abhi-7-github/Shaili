const dotenv = require('dotenv');
const connectDB = require('../config/db');
const { trainModel } = require('../services/modelTrainingService');

dotenv.config();

const runTrainingScript = async () => {
  try {
    console.log('⚡ Initializing Database connection for Model Training...');
    await connectDB();

    console.log('🚀 Training SHAILI Memory Retrieval & Feature Classification Model...');
    const result = await trainModel();

    console.log('====================================================');
    console.log('🎉 TRAINING RESULTS SUMMARY');
    console.log('====================================================');
    console.log(`Status:               SUCCESS`);
    console.log(`Total Images Processed: ${result.totalProcessed}`);
    console.log(`Categories Trained:    ${result.categoriesTrained}`);
    console.log(`Tags Generated:        ${result.tagsGenerated}`);
    console.log(`Duration:              ${result.durationMs} ms`);
    console.log('====================================================');

    process.exit(0);
  } catch (error) {
    console.error('❌ Model Training Script Failed:', error);
    process.exit(1);
  }
};

runTrainingScript();
