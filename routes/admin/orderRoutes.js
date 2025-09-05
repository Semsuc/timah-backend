// server/routes/admin/orderRoutes.js
const express = require("express");
const router = express.Router();
const asyncHandler = require("express-async-handler");

// 🔐 Middleware
const { protect, isAdmin } = require("../../middlewares/authMiddleware");

// 📦 Controller
const {
  getAllOrders,
  getOrderById,
  updateOrderStatus,
  deleteOrder,
  markPaymentPaid, // Admin marks COD payment as paid
} = require("../../controllers/orderController");

// ===================
// PROTECTION: Admin-only
// ===================
router.use(protect); // must be logged in
router.use(isAdmin); // must be admin

// ===================
// ADMIN ORDER ROUTES
// ===================

// Get all orders
// GET /api/admin/orders
router.get("/", asyncHandler(getAllOrders));

// Get single order by ID
// GET /api/admin/orders/:id
router.get("/:id", asyncHandler(getOrderById));

// Update order status
// PUT /api/admin/orders/:id/status
router.put("/:id/status", asyncHandler(updateOrderStatus));

// Mark COD payment as Paid
// PUT /api/admin/orders/:id/mark-paid
router.put("/:id/mark-paid", asyncHandler(markPaymentPaid));

// Delete order
// DELETE /api/admin/orders/:id
router.delete("/:id", asyncHandler(deleteOrder));

module.exports = router;
