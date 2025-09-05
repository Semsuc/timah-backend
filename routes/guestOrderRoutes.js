// backend/routes/guestOrderRoutes.js
const express = require("express");
const router = express.Router();
const { trackGuestOrder, getGuestOrderById } = require("../controllers/guestOrderController");

// Track order by trackingNumber (and optional email)
router.post("/track", trackGuestOrder);

// Get guest order by MongoDB ID
router.get("/:orderId", getGuestOrderById);

module.exports = router;
