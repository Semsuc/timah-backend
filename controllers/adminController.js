// backend/controllers/adminController.js
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const AdminUser = require("../models/AdminUser");
const Order = require("../models/Order");
const Payment = require("../models/Payments");
const Review = require("../models/Review");
const MenuItem = require("../models/MenuItem");

// 🔹 Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

// ================== DASHBOARD / OVERVIEW STATS ==================
const getDashboardStats = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();

  const totalRevenueAgg = await Payment.aggregate([
    { $match: { status: "paid" } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const totalRevenue = totalRevenueAgg[0]?.total || 0;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date();
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const [todayAgg, weekAgg, monthAgg, yearAgg] = await Promise.all([
    Payment.aggregate([{ $match: { status: "paid", createdAt: { $gte: startOfDay } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $match: { status: "paid", createdAt: { $gte: startOfWeek } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $match: { status: "paid", createdAt: { $gte: startOfMonth } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
    Payment.aggregate([{ $match: { status: "paid", createdAt: { $gte: startOfYear } } }, { $group: { _id: null, total: { $sum: "$amount" } } }]),
  ]);

  const formatCurrency = (val) => ({ formatted: `$${(val || 0).toFixed(2)}`, raw: val || 0 });

  res.json({
    totalOrders,
    totalRevenue: formatCurrency(totalRevenue),
    today: formatCurrency(todayAgg[0]?.total),
    week: formatCurrency(weekAgg[0]?.total),
    month: formatCurrency(monthAgg[0]?.total),
    year: formatCurrency(yearAgg[0]?.total),
  });
});

// ================== RECENT ORDERS ==================
const getRecentOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find().sort({ createdAt: -1 }).limit(5);
  res.json(orders);
});

// ================== RECENT REVIEWS ==================
const getRecentActivity = asyncHandler(async (req, res) => {
  const reviews = await Review.find().sort({ createdAt: -1 }).limit(5);
  res.json(reviews);
});

// ================== PAYMENTS ==================
const getPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find().sort({ createdAt: -1 });
  res.json(payments);
});

// ================== CONTENT COUNT ==================
const getContentCount = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();
  const totalPayments = await Payment.countDocuments();
  const totalReviews = await Review.countDocuments();
  const totalMenuItems = await MenuItem.countDocuments();

  res.json({ totalOrders, totalPayments, totalReviews, totalMenuItems });
});

// ================== ADMIN PROFILE ==================
const getAdminProfile = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin._id).select("-password");
  res.json(admin);
});

const updateAdminProfile = asyncHandler(async (req, res) => {
  const admin = await AdminUser.findById(req.admin._id);
  if (!admin) {
    res.status(404);
    throw new Error("Admin not found");
  }

  const { fullName, email, password } = req.body;
  admin.fullName = fullName || admin.fullName;
  admin.email = email || admin.email;
  if (password) {
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(password, salt);
  }
  await admin.save();

  res.json({
    _id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    role: admin.role,
  });
});

// ================== ADMIN AUTH ==================
const registerAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  if (!fullName || !email || !password) {
    res.status(400);
    throw new Error("Please provide all required fields");
  }

  const existingAdmin = await AdminUser.findOne({ email });
  if (existingAdmin) {
    res.status(400);
    throw new Error("Admin already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const admin = await AdminUser.create({ fullName, email, password: hashedPassword, role: "admin" });

  const token = generateToken(admin._id);

  res.status(201).json({
    token,
    user: {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    },
  });
});

const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await AdminUser.findOne({ email });

  if (admin && (await bcrypt.compare(password, admin.password))) {
    const token = generateToken(admin._id);

    res.json({
      token,
      user: {
        _id: admin._id,
        fullName: admin.fullName,
        email: admin.email,
        role: admin.role,
      },
    });
  } else {
    res.status(401);
    throw new Error("Invalid email or password");
  }
});

module.exports = {
  getDashboardStats,
  getRecentOrders,
  getRecentActivity,
  getPayments,
  getContentCount, // ✅ Added this
  getAdminProfile,
  updateAdminProfile,
  registerAdmin,
  loginAdmin,
};
