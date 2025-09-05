// backend/middlewares/devAdminMiddleware.js
const asyncHandler = require("express-async-handler");

// Temporary developer admin
const devAdmin = {
  _id: "dev-admin-id",
  fullName: "Developer Admin",
  email: "dev@admin.com",
  role: "admin",
};

// Middleware to inject dev admin
const injectDevAdmin = asyncHandler(async (req, res, next) => {
  req.admin = devAdmin;
  next();
});

module.exports = { injectDevAdmin };
