// routes/paymentsRoutes.js
const express = require('express');
const router = express.Router();

const {
  createGuestPayment,
  createStripeSessionAfterConfirmation,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  filterPayments,
  markPaymentAsPaid,
} = require('../controllers/paymentsController');

const { protectAdmin, isAdmin } = require('../middlewares/authMiddleware');

// =================== PUBLIC ROUTES =================== //

// Guest creates an initial payment record (no login required)
router.post('/guest', createGuestPayment);

// Create Stripe session after admin confirms and verifies payment/order
router.post('/:id/confirm', createStripeSessionAfterConfirmation);

// =================== ADMIN PROTECTED ROUTES =================== //
// All routes below require admin authentication
router.use(protectAdmin, isAdmin);

// Get all payments (optionally paginated)
router.get('/', getAllPayments);

// ⚠️ Important: Place static routes BEFORE dynamic `/:id`
router.get('/filter', filterPayments);

// Get single payment details by ID
router.get('/:id', getPaymentById);

// Update payment status (e.g., success, failed, refunded)
router.patch('/:id/status', updatePaymentStatus);

// Mark payment as paid manually (useful for COD or offline payments)
router.put('/:id/mark-paid', markPaymentAsPaid);

module.exports = router;
