const express = require("express");
const router = express.Router();
const { stripeWebhook } = require("../controllers/webhookController");

// Stripe webhook needs raw body, not JSON-parsed
router.post(
  "/stripe",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;
