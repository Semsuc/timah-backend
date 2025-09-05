const jwt = require("jsonwebtoken");
const AdminUser = require("../models/AdminUser");
const ActivityLog = require("../models/ActivityLog");
const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");

// --------------------
// Generate JWT
// --------------------
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// --------------------
// Admin Login
// --------------------
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const admin = await AdminUser.findOne({ email });
  if (!admin) {
    await ActivityLog.create({
      action: `Failed login attempt (no account) for ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    await ActivityLog.create({
      adminUser: admin._id,
      action: `Failed login attempt (wrong password) for ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],
    });
    return res.status(401).json({ message: "Invalid credentials" });
  }

  admin.lastLogin = new Date();
  await admin.save();

  const token = generateToken(admin._id);

  await ActivityLog.create({
    adminUser: admin._id,
    action: `${admin.fullName} logged in`,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.status(200).json({
    token, // 👈 now token is sent in response instead of cookie
    user: {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    },
  });
});

// --------------------
// Create Admin
// --------------------
const createAdmin = asyncHandler(async (req, res) => {
  const { fullName, email, password } = req.body;

  const existing = await AdminUser.findOne({ email });
  if (existing) {
    return res.status(400).json({ message: "Admin already exists" });
  }

  const admin = await AdminUser.create({ fullName, email, password });

  const token = generateToken(admin._id);

  await ActivityLog.create({
    adminUser: admin._id,
    action: `New admin account created: ${admin.fullName}`,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"],
  });

  res.status(201).json({
    token, // 👈 return token for immediate login
    user: {
      _id: admin._id,
      fullName: admin.fullName,
      email: admin.email,
      role: admin.role,
    },
  });
});

// --------------------
// Get Admin Profile
// --------------------
const getAdminProfile = asyncHandler(async (req, res) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Not authorized" });
  }

  res.status(200).json({
    _id: req.admin._id,
    fullName: req.admin.fullName,
    email: req.admin.email,
    role: req.admin.role,
  });
});

// --------------------
// Logout Admin
// --------------------
const logoutAdmin = (req, res) => {
  // With localStorage tokens, logout is frontend-only (clear storage).
  res.status(200).json({ message: "Logged out successfully" });
};

module.exports = {
  adminLogin,
  createAdmin,
  getAdminProfile,
  logoutAdmin,
};
