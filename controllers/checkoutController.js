// backend/controllers/checkoutController.js
const asyncHandler = require('express-async-handler');
const Order = require('../models/Order');

// Helper to generate unique tracking numbers
const generateTrackingNumber = () => `TK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// ===============================
// Create guest order (COD or Stripe after admin confirmation)
// POST /api/orders
// Public
// ===============================
const createGuestOrder = asyncHandler(async (req, res) => {
  const { cartItems, customerInfo, paymentMethod } = req.body;

  // Validate cart
  if (!cartItems || cartItems.length === 0) {
    res.status(400);
    throw new Error('Cart is empty');
  }

  // Validate customer info
  const { fullName, address, phone, whatsapp, email } = customerInfo || {};
  if (!fullName || !address || !phone || !email) {
    res.status(400);
    throw new Error('Missing required customer information');
  }

  // Calculate total
  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price) * Number(item.quantity),
    0
  );

  // Map cart items to order items
  const orderItems = cartItems.map((item) => ({
    menuId: Number(item.id) || Number(item._id) || null,
    name: item.name,
    price: Number(item.price),
    quantity: Number(item.quantity),
    description: item.description || '',
    id: item._id || item.id || item.name.toLowerCase().replace(/\s+/g, '-'),
  }));

  // Create the order
  const order = await Order.create({
    name: fullName,
    email,
    phone1: phone,
    phone2: whatsapp || '',
    address,
    items: orderItems,
    total,
    paymentMethod,
    status: 'Pending',        // Always pending initially
    paymentStatus: 'Pending', // Payment not yet done
    isGuest: true,
    trackingNumber: generateTrackingNumber(),
  });

  // Redirect URL for frontend confirmation page
  const redirectUrl = `${process.env.CLIENT_URL}/order-confirmation/${order._id}`;

  res.status(201).json({
    success: true,
    order,
    redirectUrl,
    message: 'Order created successfully! Payment will be requested after admin confirmation.',
  });
});

module.exports = { createGuestOrder };
