// backend/controllers/menuController.js
const asyncHandler = require('express-async-handler');
const mongoose = require('mongoose');
const MenuItem = require('../models/MenuItem');
const io = require('../server'); // import Socket.io instance

// ------------------------------
// Helper: find by _id or numeric menuId
// ------------------------------
const findMenuItem = async (id) => {
  if (mongoose.Types.ObjectId.isValid(id)) {
    return await MenuItem.findById(id);
  } else if (!isNaN(id)) {
    return await MenuItem.findOne({ menuId: Number(id) });
  }
  return null;
};

// ------------------------------
// Create a new menu item
// POST /api/menu
// Admin only
// ------------------------------
const createMenuItem = asyncHandler(async (req, res) => {
  const { name, description, price, category, isAvailable = true } = req.body;
  const imageUrl = req.file ? `/uploads/${req.file.filename}` : '';

  if (!name || !description || !price || !category) {
    res.status(400);
    throw new Error('Please provide all required fields (name, description, price, category)');
  }

  // Generate unique numeric menuId
  const lastItem = await MenuItem.findOne().sort({ menuId: -1 });
  const newMenuId = lastItem ? lastItem.menuId + 1 : 1;

  const menuItem = await MenuItem.create({
    menuId: newMenuId,
    name,
    description,
    price: Number(price),
    category,
    imageUrl,
    isAvailable,
  });

  // Emit Socket.io event
  io.emit('menu-updated', { action: 'create', item: menuItem });

  res.status(201).json({ message: 'Menu item created successfully', menuItem });
});

// ------------------------------
// Get all menu items
// GET /api/menu
// Public
// ------------------------------
const getAllMenuItems = asyncHandler(async (req, res) => {
  const items = await MenuItem.find().sort({ createdAt: -1 });

  const adminView = req.query.admin === 'true';
  const response = items.map((item) => {
    if (adminView) return item;
    const { menuId, ...guestView } = item.toObject();
    return guestView;
  });

  res.status(200).json(response);
});

// ------------------------------
// Get single menu item by _id or menuId
// GET /api/menu/:id
// Public
// ------------------------------
const getMenuItemById = asyncHandler(async (req, res) => {
  const menuItem = await findMenuItem(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  const adminView = req.query.admin === 'true';
  if (adminView) {
    res.status(200).json(menuItem);
  } else {
    const { menuId, ...guestView } = menuItem.toObject();
    res.status(200).json(guestView);
  }
});

// ------------------------------
// Update a menu item
// PUT /api/menu/:id
// Admin only
// ------------------------------
const updateMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await findMenuItem(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  const { name, description, price, category, isAvailable } = req.body;

  if (req.file) menuItem.imageUrl = `/uploads/${req.file.filename}`;
  if (name) menuItem.name = name;
  if (description) menuItem.description = description;
  if (price !== undefined) menuItem.price = Number(price);
  if (category) menuItem.category = category;
  if (isAvailable !== undefined) menuItem.isAvailable = isAvailable;

  const updatedItem = await menuItem.save();

  io.emit('menu-updated', { action: 'update', item: updatedItem });

  res.status(200).json({ message: 'Menu item updated successfully', menuItem: updatedItem });
});

// ------------------------------
// Delete a menu item
// DELETE /api/menu/:id
// Admin only
// ------------------------------
const deleteMenuItem = asyncHandler(async (req, res) => {
  const menuItem = await findMenuItem(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  await menuItem.deleteOne();

  io.emit('menu-updated', { action: 'delete', id: req.params.id });

  res.status(200).json({ message: 'Menu item deleted successfully', id: req.params.id });
});

// ------------------------------
// Toggle availability
// PATCH /api/menu/:id/toggle
// Admin only
// ------------------------------
const toggleAvailability = asyncHandler(async (req, res) => {
  const menuItem = await findMenuItem(req.params.id);
  if (!menuItem) {
    res.status(404);
    throw new Error('Menu item not found');
  }

  menuItem.isAvailable = !menuItem.isAvailable;
  await menuItem.save();

  io.emit('menu-updated', { action: 'update', item: menuItem });

  res.status(200).json({
    message: `Menu item is now ${menuItem.isAvailable ? 'available' : 'unavailable'}`,
    menuItem,
  });
});

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
  toggleAvailability,
};
