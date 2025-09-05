// routes/settingRoutes.js
const express = require('express');
const router = express.Router();

// ✅ Make sure the filename matches exactly (case-sensitive)
const {
  getAllSettings,
  getSettingByKey,
  upsertSetting,
  deleteSetting,
} = require('../controllers/settingController'); // capital S

const { protectAdmin } = require('../middlewares/authMiddleware');

// GET all settings
router.get('/', protectAdmin, getAllSettings);

// GET setting by key
router.get('/:key', protectAdmin, getSettingByKey);

// PUT (create/update) setting
router.put('/', protectAdmin, upsertSetting);

// DELETE setting by key
router.delete('/:key', protectAdmin, deleteSetting);

module.exports = router;
