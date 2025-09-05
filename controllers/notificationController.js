const asyncHandler = require('express-async-handler');
const Notification = require('../models/Notification');
const AdminUser = require('../models/AdminUser');

/**
 * @desc   Get all notifications (super admin view)
 * @route  GET /api/notifications
 * @access Admin
 */
const getAllNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find()
    .populate('recipient', 'fullName email')
    .sort({ createdAt: -1 });

  res.status(200).json(notifications);
});

/**
 * @desc   Get notifications for the logged-in admin
 * @route  GET /api/notifications/admin
 * @access Admin
 */
const getAdminNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ recipient: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json(notifications);
});

/**
 * @desc   Send a new notification to an admin
 * @route  POST /api/notifications
 * @access Admin
 */
const sendNotification = asyncHandler(async (req, res) => {
  const { title, message, recipientId, link } = req.body;

  if (!title || !message || !recipientId) {
    res.status(400);
    throw new Error('Title, message, and recipientId are required');
  }

  const admin = await AdminUser.findById(recipientId);
  if (!admin) {
    res.status(404);
    throw new Error('Admin recipient not found');
  }

  const notification = await Notification.create({
    title,
    message,
    recipient: recipientId,
    link,
  });

  // Real-time notification via Socket.io if enabled
  const io = req.app.get('io');
  if (io) io.to(`admin-${recipientId}`).emit('new-notification', notification);

  res.status(201).json({ message: 'Notification sent', notification });
});

/**
 * @desc   Mark a notification as read
 * @route  PATCH /api/notifications/:id/read
 * @access Admin
 */
const markAsRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  if (notification.recipient.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Unauthorized');
  }

  notification.isRead = true;
  await notification.save();

  res.status(200).json({ message: 'Notification marked as read', notification });
});

/**
 * @desc   Delete a notification
 * @route  DELETE /api/notifications/:id
 * @access Admin
 */
const deleteNotification = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const notification = await Notification.findById(id);
  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  await notification.remove();
  res.status(200).json({ message: 'Notification deleted' });
});

/**
 * @desc   Send notification to all admins (useful for guest actions like orders, payments, reviews)
 */
const notifyAllAdmins = async (title, message, link = '', req = null) => {
  const admins = await AdminUser.find();

  const notifications = await Promise.all(
    admins.map(async (admin) => {
      const notification = await Notification.create({
        title,
        message,
        recipient: admin._id,
        link,
      });

      if (req?.app?.get('io')) {
        const io = req.app.get('io');
        io.to(`admin-${admin._id}`).emit('new-notification', notification);
      }

      return notification;
    })
  );

  return notifications;
};

module.exports = {
  getAllNotifications,
  getAdminNotifications,
  sendNotification,
  markAsRead,
  deleteNotification,
  notifyAllAdmins,
};
