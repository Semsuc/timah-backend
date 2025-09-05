// backend/models/AdminUser.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const AdminUserSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100,
  },

  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Please fill a valid email address',
    ],
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  role: {
    type: String,
    enum: ['admin', 'superadmin', 'editor'],
    default: 'admin',
  },

  isActive: {
    type: Boolean,
    default: true,
  },

  lastLogin: {
    type: Date,
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// 🔹 Password hashing middleware before save
AdminUserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// 🔹 Method to compare entered password with hashed password
AdminUserSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// ✅ Prevent OverwriteModelError in dev/hot-reload
const AdminUser =
  mongoose.models.AdminUser || mongoose.model('AdminUser', AdminUserSchema);

module.exports = AdminUser;
