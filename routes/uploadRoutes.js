// routes/uploadRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { protect } = require('../middlewares/authMiddleware');

// === Multer Storage Setup for Profile Pictures ===
const profileStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/profile/'),
  filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const profileUpload = multer({ storage: profileStorage });

// 🖼️ POST: Upload profile picture
router.post('/profile', protect, profileUpload.single('profilePic'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const profileUrl = `${process.env.SERVER_URL || 'http://localhost:5000'}/uploads/profile/${req.file.filename}`;
  res.status(200).json({ url: profileUrl });
});

module.exports = router;
