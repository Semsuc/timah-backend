// /routes/cartRoutes.js
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

// ===== Optional Mock Auth Middleware =====
const requireUser = (req, res, next) => {
  req.user = { id: 'mock-user-id' }; // Replace with real user auth
  next();
};
router.use(requireUser);

// ===== Cart Routes =====
// GET current user's cart
router.get('/', cartController.getCart);

// POST add item to cart
router.post('/', cartController.addToCart);

// PUT update item quantity
router.put('/', cartController.updateItem);

// DELETE a specific item
router.delete('/:productId', cartController.removeItem);

// DELETE clear entire cart
router.delete('/', cartController.clearCart);

module.exports = router;
