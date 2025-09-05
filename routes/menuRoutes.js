// backend/routes/menuRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
} = require("../controllers/MenuController");

const { protectAdmin } = require("../middlewares/authMiddleware");

// ------------------ Multer Setup ------------------ //
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/menu/"); // Folder for admin-uploaded menu images
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}${ext}`);
  },
});

const upload = multer({ storage });

// ================= PUBLIC ROUTES ================= //
router.get("/", getAllMenuItems);
router.get("/:id", getMenuItemById);

// ================= ADMIN ROUTES ================= //
// ✅ Create menu item
router.post("/", protectAdmin, upload.single("image"), createMenuItem);

// ✅ Update menu item
router.put("/:id", protectAdmin, upload.single("image"), updateMenuItem);

// ✅ Delete menu item
router.delete("/:id", protectAdmin, deleteMenuItem);

// ✅ Toggle availability
router.patch("/:id/toggle", protectAdmin, toggleAvailability);

module.exports = router;
