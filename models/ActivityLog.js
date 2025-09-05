const mongoose = require('mongoose');

const ActivityLogSchema = new mongoose.Schema({
  adminUser: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'AdminUser',
    required: false, // ✅ optional
  },
  action: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255,
  },
  ipAddress: {
    type: String,
  },
  userAgent: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// ✅ Prevent model overwrite during dev
module.exports = mongoose.models.ActivityLog || mongoose.model('ActivityLog', ActivityLogSchema);
