require("dotenv").config();
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const http = require("http");
const multer = require("multer");
const path = require("path");
const jwt = require("jsonwebtoken");
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const connectDB = require("./config/db");
const logger = require("./utils/logger");
const ActivityLog = require("./models/ActivityLog");
const Order = require("./models/Order");
const sendEmail = require("./utils/sendEmail");

// =================== Dev Admin =================== //
const devAdmin = {
  _id: "dev-admin-id",
  fullName: "Developer Admin",
  email: "dev@admin.com",
  role: "admin",
};

// =================== Routes =================== //
const authRoutes = require("./routes/authRoutes");
const menuRoutes = require("./routes/menuRoutes");
const cartRoutes = require("./routes/cartRoutes");
const orderRoutes = require("./routes/orderRoutes");
const adminOrderRoutes = require("./routes/adminOrderRoutes");
const reviewRoutes = require("./routes/reviewRoutes");
const adminRoutes = require("./routes/adminRoutes");
const settingRoutes = require("./routes/settingRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const guestOrderRoutes = require("./routes/guestOrderRoutes");

// =================== App & Server =================== //
const app = express();
const server = http.createServer(app);

// =================== Socket.IO =================== //
const { Server } = require("socket.io");
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  },
});

io.use((socket, next) => {
  const token =
    socket.handshake.auth?.token || socket.handshake.headers["authorization"];

  // ✅ Always allow dev-token
  if (token === "dev-token") {
    socket.adminId = devAdmin._id;
    return next();
  }

  if (!token) return next(new Error("Unauthorized: No token provided"));

  try {
    const decoded = jwt.verify(
      token.replace("Bearer ", ""),
      process.env.JWT_SECRET
    );
    socket.adminId = decoded.id;
    next();
  } catch (err) {
    next(new Error("Unauthorized: Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("⚡️ New admin connected:", socket.id, "adminId:", socket.adminId);
  socket.join(`admin-${socket.adminId}`);

  socket.on("disconnect", () => {
    console.log("Admin disconnected:", socket.id);
  });
});

app.set("io", io);

// =================== ENV Validation =================== //
[
  "PORT",
  "MONGO_URI",
  "JWT_SECRET",
  "EMAIL_USER",
  "EMAIL_PASS",
  "CLIENT_URL",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
].forEach((key) => {
  if (!process.env[key]) console.error(`❌ Missing ENV variable: ${key}`);
  else console.log(`✅ ${key} loaded`);
});

// =================== Stripe Webhook =================== //
// ⚠️ Webhooks need raw body, so define before express.json()
app.post(
  "/api/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error("❌ Webhook signature verification failed:", err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata.orderId;

      try {
        const order = await Order.findById(orderId);
        if (order) {
          order.paymentStatus = "Paid";
          order.status = "Processing";
          order.stripeSessionId = session.id;
          await order.save();

          try {
            await sendEmail(
              order.email,
              "💳 Payment Successful!",
              `<div style="font-family: Arial, sans-serif; color:#333;">
                <div style="text-align:center; margin-bottom:20px;">
                  <img src="${
                    process.env.SERVER_URL || "http://localhost:4500"
                  }/branding/timah-logo.png" alt="Timah's Kitchen" width="150" />
                </div>
                <h2 style="color:#5A2D82;">Hi ${order.name || "Guest"},</h2>
                <p>Your payment of <strong>£${order.total.toFixed(
                  2
                )}</strong> has been successfully received.</p>
                <p>Your order is now being processed.</p>
                <p><strong>Tracking Number:</strong> ${
                  order.trackingNumber
                }</p>
                <p style="margin-top:20px;">Thank you for ordering,<br><strong>Timah's Kitchen</strong></p>
              </div>`
            );
          } catch (err) {
            console.error("❌ Failed to send payment email:", err.message);
          }
        }
      } catch (err) {
        console.error("❌ Failed to update order from webhook:", err.message);
      }
    }

    res.status(200).json({ received: true });
  }
);

// =================== Middleware =================== //
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use(express.json());

// Activity logging middleware
app.use(async (req, res, next) => {
  try {
    await ActivityLog.create({
      adminUser: null,
      action: `${req.method} ${req.originalUrl}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] || "",
    });
  } catch (err) {
    console.error("DB log failed:", err.message);
  }
  next();
});

// =================== Static Folders =================== //
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/menu", express.static(path.join(__dirname, "data/menu")));
// ✅ Logo and branding assets
app.use("/branding", express.static(path.join(__dirname, "uploads/branding")));

// =================== Multer Config =================== //
const profileUpload = multer({
  storage: multer.diskStorage({
    destination: "uploads/profile/",
    filename: (req, file, cb) =>
      cb(null, Date.now() + path.extname(file.originalname)),
  }),
});

app.post(
  "/api/users/upload-profile-pic",
  profileUpload.single("profilePic"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    const url = `${
      process.env.SERVER_URL || "http://localhost:4500"
    }/uploads/profile/${req.file.filename}`;
    res.status(200).json({ url });
  }
);

// =================== API Routes =================== //
// Public
app.use("/api/menu", menuRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/guest-orders", guestOrderRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/reviews", reviewRoutes);

// Admin
app.use("/api/admin/orders", adminOrderRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/admin/auth", authRoutes);

// Health check
app.get("/", (req, res) => res.send("✅ Timahs Kitchen is running!"));

// 404 handler
app.use((req, res) => res.status(404).json({ message: "❌ Route not found" }));

// Global error handler
app.use((err, req, res, next) => {
  logger.error(`${err.message}\n${err.stack}`);
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

// =================== Connect DB & Start Server =================== //
connectDB()
  .then(() => {
    console.log(`✅ MongoDB connected: ${mongoose.connection.name}`);
    const PORT = process.env.PORT || 4500;
    server.listen(PORT, () =>
      logger.info(`🚀 Server running at http://localhost:${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);
  });

// Export server and io
module.exports = { app, server, io };
