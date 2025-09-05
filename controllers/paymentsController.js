const asyncHandler = require("express-async-handler");
const Payments = require("../models/Payments");
const Order = require("../models/Order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { v4: uuidv4 } = require("uuid");
const sendEmail = require("../utils/sendEmail");

// =================== PUBLIC CONTROLLERS =================== //

// @desc   Guest creates a new payment record (before checkout)
// @route  POST /api/payments/guest
// @access Public
const createGuestPayment = asyncHandler(async (req, res) => {
  const { fullName, email, phone, whatsapp, address, amount, method, description, orderId } = req.body;

  if (!fullName || !email || !amount) {
    res.status(400);
    throw new Error("Full name, email, and amount are required");
  }

  const payment = await Payments.create({
    fullName,
    email,
    phone,
    whatsapp,
    address,
    amount,
    method: method?.toLowerCase() || "card",
    reference: uuidv4(),
    description,
    orderId: orderId || null,
    currency: "USD", // default currency
    status: "pending",
  });

  // Send Timah-branded email
  try {
    let orderItems = [];
    let totalAmount = amount;

    if (orderId) {
      const order = await Order.findById(orderId);
      if (order && order.items?.length > 0) {
        orderItems = order.items.map(item => ({
          name: item.name,
          qty: item.quantity,
          price: item.price,
        }));
        totalAmount = order.total;
      }
    }

    const subject = "✅ Payment Received - Timah's Kitchen";
    const text = `Hi ${fullName}, your payment of $${amount.toFixed(
      2
    )} has been received. Reference: ${payment.reference}`;

    await sendEmail(email, subject, text, {
      highlight: "Payment Received",
      buttonText: "View Order",
      buttonLink: `${process.env.FRONTEND_URL}/order/${orderId || ""}`,
    });
  } catch (err) {
    console.error("Failed to send guest payment email:", err.message);
  }

  res.status(201).json({
    success: true,
    message: "Payment record created successfully. Confirmation email sent.",
    data: payment,
  });
});

// @desc   Create Stripe checkout session after admin confirms order
// @route  POST /api/payments/:id/confirm
// @access Public
const createStripeSessionAfterConfirmation = asyncHandler(async (req, res) => {
  const payment = await Payments.findById(req.params.id);
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }
  if (!payment.verifiedByAdmin) {
    res.status(403);
    throw new Error("Admin has not verified this payment yet");
  }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: payment.currency?.toLowerCase() || "usd",
          product_data: { name: payment.description || "Order Payment" },
          unit_amount: Math.round(payment.amount * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.FRONTEND_URL}/payment-cancel`,
    customer_email: payment.email,
    metadata: { paymentId: payment._id.toString(), reference: payment.reference },
  });

  res.status(200).json({
    success: true,
    url: session.url,
    sessionId: session.id,
  });
});

// =================== ADMIN CONTROLLERS =================== //

// @desc   Get all payments
// @route  GET /api/payments
// @access Admin
const getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payments.find()
    .populate("orderId", "name email phone total paymentStatus status")
    .sort({ createdAt: -1 });
  res.json({ success: true, count: payments.length, data: payments });
});

// @desc   Get single payment by ID
// @route  GET /api/payments/:id
// @access Admin
const getPaymentById = asyncHandler(async (req, res) => {
  const payment = await Payments.findById(req.params.id)
    .populate("orderId", "name email phone total paymentStatus status");
  if (!payment) {
    res.status(404);
    throw new Error("Payment not found");
  }
  res.json({ success: true, data: payment });
});

// @desc   Update payment status
// @route  PATCH /api/payments/:id/status
// @access Admin
const updatePaymentStatus = asyncHandler(async (req, res) => {
  const { status, verifiedByAdmin, transactionId } = req.body;
  const payment = await Payments.findById(req.params.id);
  if (!payment) throw new Error("Payment not found");

  if (status) {
    const normalized = status.toLowerCase();
    payment.status = ["paid", "success"].includes(normalized) ? "paid" : normalized;
  }
  if (transactionId) payment.transactionId = transactionId;
  if (verifiedByAdmin !== undefined) payment.verifiedByAdmin = verifiedByAdmin;
  if (payment.status === "paid") payment.paidAt = Date.now();

  const updatedPayment = await payment.save();

  if (payment.orderId) {
    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: payment.status === "paid" ? "Paid" : payment.status,
    });
  }

  res.json({ success: true, message: `Payment marked as ${payment.status}`, data: updatedPayment });
});

// @desc   Mark payment as paid manually
// @route  PUT /api/payments/:id/mark-paid
// @access Admin
const markPaymentAsPaid = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;

  const payment = await Payments.findById(req.params.id).populate(
    "orderId",
    "name email phone total paymentStatus status"
  );
  if (!payment) throw new Error("Payment not found");

  if (["paid", "success"].includes(payment.status.toLowerCase())) {
    return res.status(400).json({ message: "Payment is already marked as Paid." });
  }

  payment.status = "paid";
  payment.verifiedByAdmin = true;
  payment.paidAt = Date.now();
  if (transactionId) payment.transactionId = transactionId;

  await payment.save();

  if (payment.orderId) {
    await Order.findByIdAndUpdate(payment.orderId, { paymentStatus: "Paid" });
  }

  // Send Timah-branded email
  try {
    const subject = "💰 Payment Confirmed!";
    const message = `
      <h2>Hi ${payment.fullName || payment.orderId?.name || "Customer"},</h2>
      <p>Your payment of <strong>${payment.symbol || "$"}${payment.amount.toFixed(
      2
    )}</strong> has been verified and marked as <strong>Paid</strong>.</p>
      <p>Reference: <strong>${payment.reference}</strong></p>
      <p>Thank you for ordering with <strong>Timah's Kitchen</strong>.</p>
    `;
    await sendEmail(payment.email || payment.orderId?.email, subject, message);
  } catch (err) {
    console.error("Email sending failed:", err.message);
  }

  res.json({ success: true, message: "Payment marked as paid successfully", data: payment });
});

// @desc   Filter payments
// @route  GET /api/payments/filter
// @access Admin
const filterPayments = asyncHandler(async (req, res) => {
  const { status, method, gateway, startDate, endDate } = req.query;
  const filter = {};

  if (status) filter.status = status.toLowerCase();
  if (method) filter.method = method.toLowerCase();
  if (gateway) filter.gateway = gateway;
  if (startDate && endDate) filter.createdAt = { $gte: new Date(startDate), $lte: new Date(endDate) };

  const payments = await Payments.find(filter)
    .populate("orderId", "name email phone total paymentStatus status")
    .sort({ createdAt: -1 });

  res.json({ success: true, count: payments.length, data: payments });
});

// @desc   Payment stats for dashboard
// @route  GET /api/payments/stats
// @access Admin
const getPaymentStats = asyncHandler(async (req, res) => {
  const stats = await Payments.aggregate([
    { $group: { _id: "$status", count: { $sum: 1 }, total: { $sum: "$amount" } } },
  ]);

  const formatted = {
    total: stats.reduce((sum, s) => sum + s.count, 0),
    paid: stats.find(s => s._id?.toLowerCase() === "paid")?.count || 0,
    pending: stats.find(s => s._id?.toLowerCase() === "pending")?.count || 0,
    failed: stats.find(s => s._id?.toLowerCase() === "failed")?.count || 0,
    refunded: stats.find(s => s._id?.toLowerCase() === "refunded")?.count || 0,
    totalRevenue: stats.reduce((sum, s) => sum + (s.total || 0), 0),
  };

  res.json({ success: true, data: formatted });
});

module.exports = {
  createGuestPayment,
  createStripeSessionAfterConfirmation,
  getAllPayments,
  getPaymentById,
  updatePaymentStatus,
  markPaymentAsPaid,
  filterPayments,
  getPaymentStats,
};
