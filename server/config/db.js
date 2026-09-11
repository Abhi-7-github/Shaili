const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongoMemoryServer = null;

const connectDB = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  const primaryUri = process.env.MONGODB_URI;

  try {
    if (!primaryUri) {
      throw new Error('MONGODB_URI environment variable is not defined');
    }
    console.log('🔄 Connecting to Primary MongoDB...');
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`✅ Connected to Primary MongoDB Host: ${conn.connection.host}`);
  } catch (error) {
    console.warn(`⚠️ Primary MongoDB Connection Failed: ${error.message}`);
    console.log('🚀 Switching to automatic In-Memory MongoDB Fallback Server...');

    try {
      // Clean disconnect from failed connection attempt
      await mongoose.disconnect();

      if (!mongoMemoryServer) {
        console.log('📦 Initializing MongoMemoryServer...');
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      const memoryUri = mongoMemoryServer.getUri();
      console.log(`🔗 Connecting Mongoose to In-Memory URI: ${memoryUri}`);
      const conn = await mongoose.connect(memoryUri);
      console.log(`✅ Connected to In-Memory MongoDB Instance (${conn.connection.host})!`);
    } catch (memError) {
      console.error('❌ Failed to launch In-Memory MongoDB:', memError.message);
    }
  }
};

module.exports = connectDB;
