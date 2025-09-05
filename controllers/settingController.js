// controllers/settingController.js
const asyncHandler = require('express-async-handler');
const Setting = require('../models/setting');

// @desc    Get all settings
exports.getAllSettings = asyncHandler(async (req, res) => {
  const settings = await Setting.find();
  res.json(settings);
});

// @desc    Get setting by key
exports.getSettingByKey = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const setting = await Setting.findOne({ key });

  if (!setting) {
    res.status(404);
    throw new Error('Setting not found');
  }

  res.json(setting);
});

// @desc    Update or create setting
exports.upsertSetting = asyncHandler(async (req, res) => {
  const { key, value } = req.body;

  if (!key || value === undefined) {
    res.status(400);
    throw new Error('Key and value are required');
  }

  const setting = await Setting.findOneAndUpdate(
    { key },
    { value },
    { new: true, upsert: true, runValidators: true }
  );

  res.json(setting);
});

// @desc    Delete a setting
exports.deleteSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;

  const deleted = await Setting.findOneAndDelete({ key });

  if (!deleted) {
    res.status(404);
    throw new Error('Setting not found');
  }

  res.json({ message: `Setting '${key}' deleted` });
});
