const express = require('express');
const {
  getAllNotifications,
  getAdminNotifications,
  sendNotification,
  markAsRead,
  deleteNotification,
} = require('../controllers/notificationController');
const { protectAdmin } = require('../middlewares/authMiddleware');

const router = express.Router();

// Super admin: Get all notifications
router.get('/', protectAdmin, getAllNotifications);

// Logged-in admin: Get their notifications
router.get('/admin', protectAdmin, getAdminNotifications);

// Send a new notification to an admin
router.post('/', protectAdmin, sendNotification);

// Mark a notification as read
router.patch('/:id/read', protectAdmin, markAsRead);

// Delete a notification
router.delete('/:id', protectAdmin, deleteNotification);

module.exports = router;
