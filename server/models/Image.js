const mongoose = require('mongoose');

const imageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Image must belong to a user'],
      index: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: [true, 'Cloudinary Public ID is required'],
    },
    cloudinaryUrl: {
      type: String,
      required: [true, 'Cloudinary Secure URL is required'],
    },
    originalName: {
      type: String,
      trim: true,
    },
    categories: {
      type: [String],
      default: ['uncategorized'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      default: '',
    },
    gender: {
      type: String,
      enum: ['men', 'women', 'unisex'],
      default: 'unisex',
      index: true,
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    seedSource: {
      type: String,
      trim: true,
    },
    seedKey: {
      type: String,
      trim: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for user-scoped category and tag queries
imageSchema.index({ userId: 1, categories: 1 });
imageSchema.index({ userId: 1, tags: 1 });
imageSchema.index({ userId: 1, gender: 1 });
imageSchema.index({ userId: 1, uploadedAt: -1 });


module.exports = mongoose.model('Image', imageSchema);
