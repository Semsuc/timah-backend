const express = require('express');
const router = express.Router();

// Controllers
const {
  createReview,
  getReviews,
  deleteReview,
  updateReview,
  getReviewById,
} = require('../controllers/reviewController');

// Admin Middleware
const { protectAdmin } = require('../middlewares/authMiddleware');

// ===============================
// Public Routes
// ===============================
router.get('/', getReviews);
router.post('/', createReview);

// ===============================
// Admin Routes (Protected)
// ===============================
router.use(protectAdmin); // All routes below require admin

router.delete('/:id', deleteReview);
router.put('/:id', updateReview);
router.get('/:id', getReviewById);

module.exports = router;
