// backend/controllers/guestOrderController.js
const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");

// ===============================
// Get Guest Order by ID (MongoDB _id)
// GET /api/guest-orders/:orderId
// Public
// ===============================
const getGuestOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.orderId);

  if (!order) {
    res.status(404);
    throw new Error("Order not found");
  }

  res.json({
    success: true,
    trackingNumber: order.trackingNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    items: order.items,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt,
  });
});

// ===============================
// Track Guest Order by Tracking Number (+ optional email)
// POST /api/guest-orders/track
// Public
// ===============================
const trackGuestOrder = asyncHandler(async (req, res) => {
  const { trackingNumber, email } = req.body;

  if (!trackingNumber) {
    res.status(400);
    throw new Error("Tracking number is required");
  }

  const query = { trackingNumber };
  if (email) query.email = email; // optional extra filter

  const order = await Order.findOne(query);

  if (!order) {
    res.status(404);
    throw new Error("Order not found with provided details");
  }

  res.json({
    success: true,
    trackingNumber: order.trackingNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    items: order.items,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt,
  });
});

module.exports = { getGuestOrderById, trackGuestOrder };
