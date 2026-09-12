const mongoose = require('mongoose');

const wardrobeItemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    cloudinaryPublicId: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      required: true,
      enum: ['top', 'bottom', 'footwear', 'outerwear', 'accessory', 'dress'],
      index: true,
    },
    type: {
      type: String,
      required: true,
      trim: true,
    },

    primaryColor: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    secondaryColor: {
      type: String,
      default: '',
      trim: true,
    },
    colorFamily: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    hex: {
      type: String,
      default: '#808080',
      trim: true,
    },
    hue: {
      type: Number,
      default: 0,
    },
    saturation: {
      type: Number,
      default: 0,
    },
    lightness: {
      type: Number,
      default: 50,
    },

    pattern: {
      type: String,
      default: 'solid',
      enum: ['solid', 'striped', 'checked', 'printed', 'floral', 'textured', 'other'],
    },
    material: {
      type: String,
      default: 'cotton',
      enum: ['cotton', 'denim', 'wool', 'linen', 'silk', 'synthetic', 'leather', 'unknown'],
    },
    style: {
      type: String,
      default: 'casual',
      enum: ['casual', 'formal', 'ethnic', 'streetwear', 'smart-casual', 'sporty', 'party', 'traditional'],
      index: true,
    },
    formality: {
      type: Number,
      min: 1,
      max: 5,
      default: 3,
    },

    seasons: {
      type: [String],
      default: ['summer', 'winter', 'monsoon'],
      index: true,
    },
    occasions: {
      type: [String],
      default: ['casual', 'college', 'office', 'party', 'wedding', 'travel'],
      index: true,
    },

    timesWorn: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastWorn: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for optimal querying
wardrobeItemSchema.index({ userId: 1, category: 1 });
wardrobeItemSchema.index({ userId: 1, primaryColor: 1 });
wardrobeItemSchema.index({ userId: 1, style: 1 });
wardrobeItemSchema.index({ userId: 1, timesWorn: 1 });
wardrobeItemSchema.index({ userId: 1, occasions: 1 });
wardrobeItemSchema.index({ userId: 1, seasons: 1 });

module.exports = mongoose.model('WardrobeItem', wardrobeItemSchema);
