// models/Setting.js
const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed, // can be string, number, object, etc.
    required: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Setting', settingSchema);
