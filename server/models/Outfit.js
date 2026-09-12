const mongoose = require('mongoose');

const outfitSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    garmentIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'WardrobeItem',
        required: true,
      },
    ],
    occasion: {
      type: String,
      default: 'casual',
      trim: true,
    },
    style: {
      type: String,
      default: 'casual',
      trim: true,
    },
    weather: {
      temperature: { type: Number, default: 25 },
      condition: { type: String, default: 'sunny' },
    },
    score: {
      type: Number,
      default: 85,
    },
    wornCount: {
      type: Number,
      default: 1,
    },
    lastWorn: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

outfitSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Outfit', outfitSchema);
