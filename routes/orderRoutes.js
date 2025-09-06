// backend/routes/orderRoutes.js
const express = require("express");
const router = express.Router();

// Controllers
const {
  createOrder,
  getOrderById,
  getGuestOrderStatus,
  getOrdersByMenuId,
} = require("../controllers/orderController");

// ================= PUBLIC ROUTES ================= //

// Create new guest order (COD/Stripe)
router.post("/", createOrder);

// Guest: track order by tracking number (must come before /:id)
router.get("/track/:trackingNumber", getGuestOrderStatus);

// Get all orders containing a specific menuId
router.get("/menu/:menuId", getOrdersByMenuId);

// Get single order by MongoDB _id
router.get("/:id", getOrderById);

module.exports = router;
