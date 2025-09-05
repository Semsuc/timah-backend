const express = require('express');
const router = express.Router();
const {
  createActivityLog,
  getActivityLogs,
  deleteActivityLog,
} = require('../controllers/activityLogController');
const { protect, isAdmin } = require('../middlewares/authMiddleware'); // fixed folder name to 'middlewares' if that is correct

// 👀 Get all logs
router.get('/', protect, isAdmin, getActivityLogs);

// ➕ Create new log (optional manual logging)
router.post('/', protect, isAdmin, createActivityLog);

// ❌ Delete a log by ID
router.delete('/:id', protect, isAdmin, deleteActivityLog);

module.exports = router;
