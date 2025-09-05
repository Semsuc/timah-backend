// backend/routes/checkoutRoutes.js
const express = require('express');
const { createGuestOrder } = require('../controllers/checkoutController');

const router = express.Router();

// ===============================
// Guest Checkout Route
// POST /api/checkout
// ===============================
router.post('/', createGuestOrder);

module.exports = router;
