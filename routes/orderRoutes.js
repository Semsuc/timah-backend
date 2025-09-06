const express = require("express");
const router = express.Router();

// Controllers
const {
  createOrder,
  getOrderById,
  getGuestOrderStatus,
  getOrdersByMenuId, // 👈 NEW
} = require("../controllers/orderController");

// ✅ Import admin order routes
const adminOrderRoutes = require("./adminOrderRoutes");

// ================= PUBLIC ROUTES =================
// Create new guest order (COD/Stripe)
router.post("/", createOrder);

// Guest: track order by tracking number (must come before /:id)
router.get("/track/:trackingNumber", getGuestOrderStatus);

// Get all orders containing a specific menuId
router.get("/menu/:menuId", getOrdersByMenuId); // 👈 NEW

// Get single order by MongoDB _id
router.get("/:id", getOrderById);

// ================= ADMIN ROUTES =================
// Mounted at /api/orders/admin
router.use("/admin", adminOrderRoutes);

module.exports = router;
