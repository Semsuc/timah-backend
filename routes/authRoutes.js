const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const {
  adminLogin,
  createAdmin,
  getAdminProfile,
  logoutAdmin,
} = require("../controllers/authController");
const { protect } = require("../middlewares/authMiddleware");

// ==================
// Validation Helper
// ==================
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ message: errors.array()[0].msg });
  }
  next();
};

// ==================
// Admin Login
// ==================
router.post(
  "/login",
  [
    check("email").isEmail().withMessage("Valid email is required"),
    check("password").notEmpty().withMessage("Password is required"),
  ],
  validate,
  adminLogin
);

// ==================
// Create Admin
// ==================
router.post(
  "/signup",
  [
    check("fullName").notEmpty().withMessage("Full name is required"),
    check("email").isEmail().withMessage("Valid email is required"),
    check("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
  ],
  validate,
  createAdmin
);

// ==================
// Get Admin Profile (Protected)
// ==================
router.get("/me", protect, getAdminProfile);

// ==================
// Logout Admin
// ==================
router.post("/logout", protect, logoutAdmin);

module.exports = router;
