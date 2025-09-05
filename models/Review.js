const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Guest reviews can have no userId
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null, // Optional link to order if delivered
    },
    name: {
      type: String,
      trim: true,
      default: 'Anonymous', // Default name for guest reviews
      maxlength: 100,
    },
    location: {
      type: String,
      trim: true,
      maxlength: 100,
    },
    content: {
      type: String,
      required: [true, 'Review content is required'], // Content is mandatory
      trim: true,
      maxlength: 1000,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      default: 5,
    },
    isApproved: {
      type: Boolean,
      default: false, // Reviews need admin approval
    },
    isFeatured: {
      type: Boolean,
      default: false, // Admin can mark review as featured
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt automatically
);

// Optional: add a virtual to get short content preview
reviewSchema.virtual('shortContent').get(function () {
  return this.content.length > 100 ? this.content.slice(0, 100) + '...' : this.content;
});

module.exports = mongoose.model('Review', reviewSchema);
