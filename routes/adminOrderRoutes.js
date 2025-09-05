const express = require("express");
const router = express.Router();
const {
  getAllOrders,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/orderController");

// Correct import
const { protectAdmin } = require("../middlewares/authMiddleware");

// ================= ADMIN ROUTES =================
// Get all orders
router.get("/", protectAdmin, getAllOrders);

// Update order status
router.put("/:id/status", protectAdmin, updateOrderStatus);

// Delete an order
router.delete("/:id", protectAdmin, deleteOrder);

module.exports = router;
