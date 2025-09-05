const asyncHandler = require('express-async-handler');
const ActivityLog = require('../models/ActivityLog');

// @desc    Create a new activity log
// @route   POST /api/activity-log
// @access  Admin
const createActivityLog = asyncHandler(async (req, res) => {
  const { action, ipAddress, userAgent } = req.body;

  if (!action) {
    res.status(400);
    throw new Error('Action is required');
  }

  const log = await ActivityLog.create({
    adminUser: req.admin._id, // updated to req.admin
    action,
    ipAddress,
    userAgent,
  });

  res.status(201).json(log);
});

// @desc    Get all activity logs
// @route   GET /api/activity-log
// @access  Admin
const getActivityLogs = asyncHandler(async (req, res) => {
  const logs = await ActivityLog.find()
    .populate('adminUser', 'fullName email')
    .sort({ createdAt: -1 });

  res.status(200).json(logs);
});

// @desc    Delete an activity log by ID
// @route   DELETE /api/activity-log/:id
// @access  Admin
const deleteActivityLog = asyncHandler(async (req, res) => {
  const log = await ActivityLog.findById(req.params.id);

  if (!log) {
    res.status(404);
    throw new Error('Activity log not found');
  }

  await log.deleteOne();
  res.status(200).json({ message: 'Activity log deleted successfully' });
});

module.exports = {
  createActivityLog,
  getActivityLogs,
  deleteActivityLog,
};
