// server/seedMenu.js
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Menu = require("./models/MenuItem.js"); 
const connectDB = require("./config/db.js"); 
const menuItems = require("./data/menuItems.js"); // ✅ import menu items

dotenv.config();

// =======================
// 📌 SEED FUNCTION
// =======================
const seedMenu = async () => {
  try {
    await connectDB();               // Connect to MongoDB
    await Menu.deleteMany();         // Clear old items
    await Menu.insertMany(menuItems); // Insert new items
    console.log("✅ Menu data seeded successfully!");
    mongoose.connection.close();     // Close DB connection
  } catch (error) {
    console.error("❌ Error seeding menu data:", error);
    process.exit(1);
  }
};

seedMenu();
