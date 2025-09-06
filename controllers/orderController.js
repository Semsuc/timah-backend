// backend/controllers/orderController.js
const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");
const sendEmail = require("../utils/sendEmail");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

// Helper to generate unique tracking numbers
const generateTrackingNumber = () =>
  `TK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// ===============================
// Create order for guest checkout (COD or Stripe)
// POST /api/orders
// Public
// ===============================
exports.createOrder = asyncHandler(async (req, res) => {
  const { name, email, phone1, phone2, address, items, total, paymentMethod } =
    req.body;

  if (!items || items.length === 0) {
    res.status(400);
    throw new Error("No items in order.");
  }

  // Map slug to numeric menuId
  const orderItems = [];
  for (const item of items) {
    let menuId = item.menuId;
    if (!menuId && item.slug) {
      const menuItem = await MenuItem.findOne({ slug: item.slug });
      if (!menuItem) {
        res.status(400);
        throw new Error(`Menu item not found for slug: ${item.slug}`);
      }
      menuId = menuItem.menuId;
    }

    orderItems.push({
      menuId, // ✅ keep only menuId, not item._id
      name: item.name,
      quantity: item.quantity,
      price: item.price,
    });
  }

  const newOrder = new Order({
    name,
    email,
    phone1,
    phone2: phone2 || "",
    address,
    items: orderItems,
    total,
    status: "Pending", // order is pending until admin confirms
    paymentStatus: "Pending", // payment remains pending
    paymentMethod,
    isGuest: true,
    trackingNumber: generateTrackingNumber(),
  });

  const savedOrder = await newOrder.save();

  // Send initial “order received” email
  try {
    const subject = "✅ Order Received!";
    const message = `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #333;">
        <div style="text-align:center; margin-bottom: 20px;">
          <img src="${process.env.CLIENT_URL}/logo.png" alt="Timah's Kitchen" width="150" />
        </div>
        <h2 style="color:#5A2D82;">Hi ${savedOrder.name || "Guest"},</h2>
        <p>Your order has been received on <strong>${new Date(
          savedOrder.createdAt
        ).toLocaleString()}</strong>, totaling <strong>£${savedOrder.total.toFixed(
      2
    )}</strong>.</p>
        <p><strong>Tracking Number:</strong> ${savedOrder.trackingNumber}</p>
        <h3>Order Details:</h3>
        <ul>
          ${savedOrder.items
            .map(
              (item) =>
                `<li>MenuID: ${item.menuId} | ${item.name} x${item.quantity} (£${item.price})</li>`
            )
            .join("")}
        </ul>
        <p>We will notify you when your order is confirmed by the admin and ready for delivery.</p>
        <p style="margin-top:20px;">Thank you,<br><strong>Timah's Kitchen</strong></p>
      </div>`;
    await sendEmail(savedOrder.email, subject, message);
  } catch (err) {
    console.error("Failed to send order confirmation email:", err.message);
  }

  res.status(201).json({ success: true, order: savedOrder });
});

// ===============================
// Get single order by MongoDB ID
// GET /api/orders/:id
// Public
// ===============================
exports.getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) res.status(404).json({ message: "Order not found" });
  else res.json(order);
});

// ===============================
// Get Guest Order Status by Tracking Number
// GET /api/orders/track/:trackingNumber
// Public
// ===============================
exports.getGuestOrderStatus = asyncHandler(async (req, res) => {
  const { trackingNumber } = req.params;
  const order = await Order.findOne({ trackingNumber });

  if (!order) {
    return res.status(404).json({ success: false, message: "Order not found" });
  }

  res.json({
    success: true,
    trackingNumber: order.trackingNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    total: order.total,
    items: order.items,
    estimatedDelivery: order.estimatedDelivery,
    createdAt: order.createdAt,
    stripeSessionId: order.stripeSessionId || null,
  });
});

// ===============================
// Admin: Get all orders
// GET /api/admin/orders
// Private/Admin
// ===============================
exports.getAllOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 });
  res.json(orders);
});

// ===============================
// Admin: Update order status (Stripe payment on confirmation)
// PUT /api/admin/orders/:id/status
// Private/Admin
// ===============================
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  const statusFlow = [
    "Pending",
    "Confirmed",
    "Processing",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
  ];
  const currentIndex = statusFlow.indexOf(order.status);
  const newIndex = statusFlow.indexOf(status);

  if (newIndex === -1) throw new Error("Invalid status value");
  if (newIndex < currentIndex)
    throw new Error("Cannot move order backward in status flow");

  order.status = status;
  if (!order.trackingNumber) order.trackingNumber = generateTrackingNumber();

  // Stripe session creation if order confirmed and payment method is Stripe
  let stripePaymentLink = null;
  if (status === "Confirmed" && order.paymentMethod.toLowerCase() === "stripe") {
    const line_items = order.items.map((item) => ({
      price_data: {
        currency: "gbp",
        product_data: { name: item.name },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items,
        customer_email: order.email,
        success_url: `${process.env.CLIENT_URL}/order-success?orderId=${order._id}`,
        cancel_url: `${process.env.CLIENT_URL}/cancel-payment?orderId=${order._id}`,
        metadata: { orderId: order._id.toString() },
      });

      order.stripeSessionId = session.id;
      stripePaymentLink = session.url;
      await order.save();
    } catch (err) {
      console.error("Failed to create Stripe session:", err.message);
    }
  }

  const updatedOrder = await order.save();

  // Email content
  let subject = `📢 Order Status Updated: ${order.status}`;
  let message = `Your order status is now: ${order.status}`;

  if (status === "Confirmed" && stripePaymentLink) {
    subject = "📦 Your order is confirmed!";
    message = `
      Your order has been confirmed by the admin! Please complete your online payment by clicking below:
      <br/><br/>
      <a href="${stripePaymentLink}" style="background:#5A2D82;color:white;padding:10px 20px;border-radius:5px;text-decoration:none;">Pay Online Now</a>
      <br/><br/>
      Tracking Number: ${order.trackingNumber}<br/>
      Total: £${order.total.toFixed(2)}
    `;
  } else {
    switch (order.status) {
      case "Processing":
        subject = "📦 Your order is being processed!";
        message = "Your order is now in processing.";
        break;
      case "Out for Delivery":
        subject = "🚚 Your order is out for delivery!";
        message = "Your order is on the way.";
        break;
      case "Delivered":
        subject = "✅ Your order has been delivered!";
        message = `Your order has been delivered successfully. Payment status: ${order.paymentStatus}`;
        break;
      case "Cancelled":
        subject = "❌ Your order has been cancelled";
        message =
          "Your order has been cancelled. Please contact us if this is a mistake.";
        break;
    }
  }

  // Send email to guest
  try {
    await sendEmail(
      order.email,
      subject,
      `<div style="font-family: Arial, sans-serif; color:#333;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="${process.env.CLIENT_URL}/logo.png" width="150" alt="Timah's Kitchen"/>
        </div>
        <h2>Hi ${order.name || "Guest"},</h2>
        <p>${message}</p>
        <p style="margin-top:20px;">Thank you,<br><strong>Timah's Kitchen</strong></p>
      </div>`
    );
  } catch (err) {
    console.error("Failed to send status email:", err.message);
  }

  res.json({
    message: `Order status updated to "${order.status}"`,
    order: updatedOrder,
  });
});

// ===============================
// Admin: Mark COD payment as Paid
// PUT /api/admin/orders/:id/mark-paid
// Private/Admin
// ===============================
exports.markPaymentPaid = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  if (order.paymentMethod.toLowerCase() !== "cod")
    throw new Error("Only COD payments can be marked manually");

  order.paymentStatus = "Paid";
  await order.save();

  res.json({ message: "COD payment marked as Paid", order });
});

// ===============================
// Admin: Delete order
// DELETE /api/admin/orders/:id
// Private/Admin
// ===============================
exports.deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new Error("Order not found");

  await order.deleteOne();
  res.json({ message: "Order deleted successfully" });
});
