const express = require('express');
const router = express.Router();

// 🔐 Middleware
const { protect, isAdmin } = require('../middlewares/authMiddleware');

// 📈 Analytics Controller
const {
  getAnalyticsOverview,
  getOrderStats,
  getRevenueStats,
  getMenuItemStats,
  getReviewStats,
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getYearlySales,
  getAllSalesTrends,
  getRecentActivityLog,
} = require('../controllers/analyticsController');

// ==========================
// APPLY PROTECTION
// ==========================
router.use(protect, isAdmin); // All analytics routes are admin-only

// ==========================
// 📊 OVERVIEW STATS
// ==========================
router.get('/stats/overview', getAnalyticsOverview);
router.get('/stats/orders', getOrderStats);
router.get('/stats/revenue', getRevenueStats);
router.get('/stats/menu-items', getMenuItemStats);
router.get('/stats/reviews', getReviewStats);

// ==========================
// 📈 SALES CHARTS
// ==========================
router.get('/sales/daily', getDailySales);
router.get('/sales/weekly', getWeeklySales);
router.get('/sales/monthly', getMonthlySales);
router.get('/sales/yearly', getYearlySales);
router.get('/sales/all-trends', getAllSalesTrends);

// ==========================
// 📝 ACTIVITY LOG
// ==========================
router.get('/activity/recent', getRecentActivityLog);

module.exports = router;
