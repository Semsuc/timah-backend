const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const AdminUser = require('../models/AdminUser');
const bcrypt = require('bcryptjs');
const ActivityLog = require('../models/ActivityLog');

// @desc    Admin Login
// @route   POST /api/admin/auth/login
// @access  Public
const adminLogin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    res.status(400);
    throw new Error('Please enter both email and password');
  }

  // Find admin user
  const admin = await AdminUser.findOne({ email });
  if (!admin) {
    await ActivityLog.create({
      action: `Failed login attempt (no account) for ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Check password
  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    await ActivityLog.create({
      adminUser: admin._id,
      action: `Failed login attempt (wrong password) for ${email}`,
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });
    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Generate JWT
  const token = jwt.sign({ id: admin._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  // Log successful login
  await ActivityLog.create({
    adminUser: admin._id,
    action: `${admin.fullName} logged in`,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  // Respond with token and user info
  res.status(200).json({
    _id: admin._id,
    fullName: admin.fullName,
    email: admin.email,
    role: admin.role,
    token,
  });
});

module.exports = {
  adminLogin,
};
