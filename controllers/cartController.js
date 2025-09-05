// /controllers/cartController.js
const Cart = require('../models/Cart');
const MenuItem = require('../models/MenuItem'); // optional, for validation

// Helper: get or create a cart for a user or guest
const getOrCreateCart = async (userId, sessionId) => {
  let cart;
  if (userId) {
    cart = await Cart.findOne({ userId });
    if (!cart) cart = await Cart.create({ userId, items: [] });
  } else if (sessionId) {
    cart = await Cart.findOne({ sessionId });
    if (!cart) cart = await Cart.create({ sessionId, items: [] });
  } else {
    throw new Error("No user or session identifier provided");
  }
  return cart;
};

// GET /api/cart
exports.getCart = async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user?.id, req.headers['x-session-id']);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch cart', details: err.message });
  }
};

// POST /api/cart
exports.addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const sessionId = req.headers['x-session-id'];
  try {
    const cart = await getOrCreateCart(req.user?.id, sessionId);

    // Optional: validate product exists
    const product = await MenuItem.findById(productId);
    if (!product) return res.status(404).json({ error: 'Menu item not found' });

    const existingItem = cart.items.find(item => item.productId.toString() === productId);
    if (existingItem) existingItem.quantity += quantity;
    else cart.items.push({ productId, quantity });

    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add to cart', details: err.message });
  }
};

// PUT /api/cart
exports.updateItem = async (req, res) => {
  const { productId, quantity } = req.body;
  const sessionId = req.headers['x-session-id'];
  try {
    const cart = await getOrCreateCart(req.user?.id, sessionId);
    const item = cart.items.find(i => i.productId.toString() === productId);
    if (!item) return res.status(404).json({ error: 'Item not found in cart' });

    item.quantity = quantity;
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item', details: err.message });
  }
};

// DELETE /api/cart/:productId
exports.removeItem = async (req, res) => {
  const { productId } = req.params;
  const sessionId = req.headers['x-session-id'];
  try {
    const cart = await getOrCreateCart(req.user?.id, sessionId);
    cart.items = cart.items.filter(item => item.productId.toString() !== productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to remove item', details: err.message });
  }
};

// DELETE /api/cart
exports.clearCart = async (req, res) => {
  const sessionId = req.headers['x-session-id'];
  try {
    const cart = await getOrCreateCart(req.user?.id, sessionId);
    cart.items = [];
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear cart', details: err.message });
  }
};
