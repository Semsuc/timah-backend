const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const AdminUser = require("../models/AdminUser");

// 🔹 Verify JWT from Authorization header
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    try {
      // Extract token
      token = req.headers.authorization.split(" ")[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Attach admin user
      req.admin = await AdminUser.findById(decoded.id).select("-password");

      if (!req.admin) {
        res.status(401);
        throw new Error("Admin not found");
      }

      return next();
    } catch (error) {
      console.error("JWT verification failed:", error.message);
      res.status(401);
      throw new Error("Not authorized, token failed");
    }
  }

  if (!token) {
    res.status(401);
    throw new Error("Not authorized, no token");
  }
});

// 🔹 Ensure user has admin role
const isAdmin = (req, res, next) => {
  if (req.admin && req.admin.role === "admin") {
    return next();
  } else {
    res.status(403);
    throw new Error("Not authorized as admin");
  }
};

// 🔹 Combined middleware for admin-only routes
const protectAdmin = [protect, isAdmin];

module.exports = { protect, isAdmin, protectAdmin };
