// backend/models/MenuItem.js
const mongoose = require('mongoose');

const MenuItemSchema = new mongoose.Schema({
  // Custom auto-increment numeric ID for admins/customers
  menuId: {
    type: Number,
    unique: true, // ensure uniqueness
    index: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 150,
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500,
  },
  price: {
    type: Number,
    required: true,
    min: 0,
  },
  category: {
    type: String,
    trim: true,
    default: 'General',
  },
  imageUrl: {
    type: String,
    default: '', // URL or path to image
  },
  isAvailable: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
  },
});

// Auto-update `updatedAt`
MenuItemSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

// Auto-generate incremental menuId if not already set
MenuItemSchema.pre('save', async function (next) {
  if (!this.menuId) {
    const lastItem = await mongoose.model('MenuItem').findOne().sort({ menuId: -1 });
    this.menuId = lastItem ? lastItem.menuId + 1 : 1; // start from 1
  }
  next();
});

module.exports = mongoose.model('MenuItem', MenuItemSchema);
