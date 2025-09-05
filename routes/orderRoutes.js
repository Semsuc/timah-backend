const express = require("express");
const router = express.Router();

// Controllers
const {
  createOrder,
  getOrderById,
  getGuestOrderStatus,
} = require("../controllers/orderController");

// ✅ Import admin order routes
const adminOrderRoutes = require("./adminOrderRoutes");

// ================= PUBLIC ROUTES =================
// Create new guest order (COD/Stripe)
router.post("/", createOrder);

// Get single order by MongoDB _id
router.get("/:id", getOrderById);

// Guest: track order by tracking number
router.get("/track/:trackingNumber", getGuestOrderStatus);

// ================= ADMIN ROUTES =================
// Mounted at /api/orders/admin
router.use("/admin", adminOrderRoutes);

module.exports = router;
