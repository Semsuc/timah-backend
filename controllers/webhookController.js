const Order = require("../models/Order");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const sendEmail = require("../utils/sendEmail");

exports.stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("⚠️ Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle events
  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const orderId = session.metadata.orderId;

    try {
      const order = await Order.findById(orderId);
      if (order) {
        order.paymentStatus = "Paid";
        order.status = "Processing";
        order.stripeSessionId = session.id;
        if (!order.trackingNumber)
          order.trackingNumber = `TK-${Date.now()}-${Math.floor(
            Math.random() * 1000
          )}`;
        await order.save();

        // Send confirmation email
        const subject = "💳 Payment Successful!";
        const message = `
          <div style="font-family: Arial, sans-serif; color:#333;">
            <div style="text-align:center; margin-bottom:20px;">
              <img src="${process.env.CLIENT_URL}/logo.png" alt="Timah's Kitchen" width="150" />
            </div>
            <h2 style="color:#5A2D82;">Hi ${order.name || "Guest"},</h2>
            <p>Your payment of <strong>£${order.total.toFixed(
              2
            )}</strong> has been successfully received.</p>
            <p>Your order is now being processed.</p>
            <p><strong>Tracking Number:</strong> ${order.trackingNumber}</p>
            <p style="margin-top:20px;">Thank you for ordering,<br><strong>Timah's Kitchen</strong></p>
          </div>
        `;
        await sendEmail(order.email, subject, message);
      }
    } catch (err) {
      console.error("Error updating order from webhook:", err.message);
    }
  }

  res.json({ received: true });
};
