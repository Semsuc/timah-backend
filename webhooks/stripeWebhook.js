// webhooks/stripeWebhook.js
const asyncHandler = require('express-async-handler');
const Stripe = require('stripe');
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/orderModel');
const Payments = require('../models/Payments');

// Stripe requires raw body for webhook verification
const handleStripeWebhook = asyncHandler(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;

    const {
      fullName,
      address,
      phone,
      whatsapp,
      email,
      items,
    } = session.metadata;

    const parsedItems = JSON.parse(items || '[]');

    try {
      // ✅ 1. Save Payment Record
      const payment = await Payments.findOneAndUpdate(
        { reference: session.id }, // session.id used as reference
        {
          fullName,
          email,
          phone,
          whatsapp,
          address,
          amount: session.amount_total / 100,
          currency: session.currency.toUpperCase(),
          symbol: session.currency.toUpperCase() === "USD" ? "$" : "£",
          method: "card",
          status: "success",
          reference: session.id,
          transactionId: session.payment_intent,
          gateway: "Stripe",
          paidAt: new Date(),
          description: `Stripe payment for order`,
          verifiedByAdmin: true
        },
        { upsert: true, new: true }
      );

      // ✅ 2. Save Order Linked to Payment
      const newOrder = new Order({
        fullName,
        address,
        phone,
        whatsapp,
        email,
        items: parsedItems,
        paymentStatus: 'paid',
        paymentId: payment._id, // link to Payment document
        totalAmount: session.amount_total / 100,
        currency: session.currency.toUpperCase(),
        isGuest: true,
      });

      await newOrder.save();

      console.log('✅ Order & Payment saved from Stripe session:', session.id);
    } catch (error) {
      console.error('❌ Failed to save order/payment:', error.message);
    }
  }

  res.status(200).json({ received: true });
});

module.exports = { handleStripeWebhook };
