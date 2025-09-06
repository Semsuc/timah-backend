// backend/models/Order.js
const mongoose = require("mongoose");

// Individual items in an order
const orderItemSchema = new mongoose.Schema({
  menuId: { type: Number, required: true }, // Numeric ID from your menu data
  name: { type: String, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
});

// Main order schema
const orderSchema = new mongoose.Schema(
  {
    // Customer info
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      match: [/.+@.+\..+/, "Please enter a valid email address"],
    },
    phone1: { type: String, required: true },
    phone2: { type: String },
    address: { type: String, required: true },

    // Items & total
    items: [orderItemSchema],
    total: { type: Number, required: true },

    // Order status flow
    status: {
      type: String,
      enum: [
        "Pending",
        "Pending Payment",
        "Confirmed",
        "Processing",
        "Ready for Delivery",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
      ],
      default: "Pending",
    },

    // Payment info
    paymentMethod: {
      type: String,
      enum: ["cod", "stripe"],
      default: "cod",
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    // Guest checkout flag
    isGuest: { type: Boolean, default: true },

    // Stripe session ID (for Stripe integration)
    stripeSessionId: { type: String, default: null },

    // Tracking number
    trackingNumber: { type: String, default: null, index: true },

    // ETA for delivery tracking
    estimatedDelivery: { type: Date, default: null },
  },
  {
    timestamps: true,
  }
);

// Auto-generate tracking number
orderSchema.pre("save", function (next) {
  if (!this.trackingNumber) {
    this.trackingNumber =
      "TK-" +
      Date.now().toString(36) +
      "-" +
      Math.floor(Math.random() * 1000);
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
