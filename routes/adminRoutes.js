const express = require('express');
const router = express.Router();

// 🔐 Middleware
const { protectAdmin } = require('../middlewares/authMiddleware');

// 📊 Admin Controller
const {
  getDashboardStats,
  getPayments,
  getContentCount,
  getAdminProfile,
  updateAdminProfile,
} = require('../controllers/adminController');

// 🍽 Menu Controller
const { createMenuItem } = require('../controllers/MenuController');

// 📦 Order Controller
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
} = require('../controllers/orderController');

// ==========================
// APPLY PROTECTION
// ==========================
router.use(protectAdmin); // ✅ All routes below are admin-only

// ==========================
// 📊 DASHBOARD
// ==========================
router.get('/dashboard-summary', getDashboardStats);
router.get('/content-count', getContentCount);

// ==========================
// 💳 PAYMENT MANAGEMENT
// ==========================
router.get('/payments', getPayments);

// ==========================
// 👤 ADMIN PROFILE
// ==========================
router.get('/profile', getAdminProfile);
router.put('/profile', updateAdminProfile);

// ==========================
// 🍽 MENU MANAGEMENT
// ==========================
router.post('/menu', createMenuItem);

// ==========================
// 📦 ORDER MANAGEMENT
// ==========================
router.get('/orders', getAllOrders);
router.get('/orders/:id', getOrderById);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

module.exports = router;
