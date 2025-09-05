const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow PDF, images, videos, etc. Adjust as needed.
  const allowedTypes = /jpeg|jpg|png|pdf|mp4|mov|avi/;
  const isValid = allowedTypes.test(file.mimetype);
  if (isValid) cb(null, true);
  else cb(new Error('File type not supported'), false);
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 5MB max file size
  fileFilter,
});

module.exports = upload;
