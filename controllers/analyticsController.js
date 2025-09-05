const asyncHandler = require("express-async-handler");
const Order = require("../models/Order");
const MenuItem = require("../models/MenuItem");

// ------------------------------
// Helper: Currency formatting (GBP)
// ------------------------------
const formatGBP = (amount) => ({
  raw: Number(amount || 0),
  formatted: `£${Number(amount || 0).toFixed(2)}`,
  currency: "GBP",
  symbol: "£",
});

// 🔹 Shared sales aggregation utility
const aggregateSales = async (startDate, groupBy) => {
  let group;
  if (groupBy === "day") group = { _id: { $dayOfWeek: "$createdAt" }, total: { $sum: "$total" } };
  if (groupBy === "week") group = { _id: { $week: "$createdAt" }, total: { $sum: "$total" } };
  if (groupBy === "month") group = { _id: { $month: "$createdAt" }, total: { $sum: "$total" } };
  if (groupBy === "year") group = { _id: { $year: "$createdAt" }, total: { $sum: "$total" } };

  const data = await Order.aggregate([
    { $match: { paymentStatus: "Paid", createdAt: { $gte: startDate } } },
    { $group: group },
    { $project: { key: "$_id", total: 1, _id: 0 } },
    { $sort: { key: 1 } },
  ]);

  return data.map((d) => ({ ...d, total: d.total || 0 }));
};

// ------------------------------
// 1️⃣ Overview (Guests Only)
// ------------------------------
const getAnalyticsOverview = asyncHandler(async (req, res) => {
  const totalOrders = await Order.countDocuments();

  const totalReviewsData = await Order.aggregate([
    { $unwind: "$reviews" },
    { $count: "totalReviews" },
  ]);
  const totalReviews = totalReviewsData[0]?.totalReviews || 0;

  const totalRevenueData = await Order.aggregate([
    { $match: { paymentStatus: "Paid" } },
    { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
  ]);
  const totalRevenue = totalRevenueData[0]?.totalRevenue || 0;

  res.status(200).json({
    totalOrders,
    totalReviews,
    totalRevenue: formatGBP(totalRevenue),
  });
});

// ------------------------------
// 2️⃣ Order Stats
// ------------------------------
const getOrderStats = asyncHandler(async (req, res) => {
  const [pending, delivered, cancelled] = await Promise.all([
    Order.countDocuments({ status: "Pending" }),
    Order.countDocuments({ status: "Delivered" }),
    Order.countDocuments({ status: "Cancelled" }),
  ]);

  res.status(200).json({ pending, delivered, cancelled });
});

// ------------------------------
// 3️⃣ Revenue Stats
// ------------------------------
const getRevenueStats = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfYear = new Date(now.getFullYear(), 0, 1);

  const calcRevenue = async (startDate) => {
    const result = await Order.aggregate([
      { $match: { paymentStatus: "Paid", createdAt: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: "$total" } } },
    ]);
    return result[0]?.total || 0;
  };

  const [today, week, month, year] = await Promise.all([
    calcRevenue(startOfToday),
    calcRevenue(startOfWeek),
    calcRevenue(startOfMonth),
    calcRevenue(startOfYear),
  ]);

  res.status(200).json({
    today: formatGBP(today),
    week: formatGBP(week),
    month: formatGBP(month),
    year: formatGBP(year),
  });
});

// ------------------------------
// 4️⃣ Menu Item Stats
// ------------------------------
const getMenuItemStats = asyncHandler(async (req, res) => {
  const [mostOrdered, leastOrdered] = await Promise.all([
    MenuItem.find().sort({ ordersCount: -1 }).limit(1).lean(),
    MenuItem.find().sort({ ordersCount: 1 }).limit(1).lean(),
  ]);

  res.status(200).json({
    mostOrdered: mostOrdered[0] || null,
    leastOrdered: leastOrdered[0] || null,
  });
});

// ------------------------------
// 5️⃣ Review Stats
// ------------------------------
const getReviewStats = asyncHandler(async (req, res) => {
  const reviewData = await Order.aggregate([
    { $unwind: "$reviews" },
    {
      $group: {
        _id: null,
        averageRating: { $avg: "$reviews.rating" },
        totalReviews: { $sum: 1 },
      },
    },
  ]);

  res.status(200).json({
    averageRating: reviewData[0]?.averageRating?.toFixed(1) || 0,
    totalReviews: reviewData[0]?.totalReviews || 0,
  });
});

// ------------------------------
// 6️⃣ Daily Sales
// ------------------------------
const getDailySales = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(start.getDate() - 6);
  const daily = await aggregateSales(start, "day");
  res.status(200).json(daily);
});

// ------------------------------
// 7️⃣ Weekly Sales
// ------------------------------
const getWeeklySales = asyncHandler(async (req, res) => {
  const start = new Date();
  start.setDate(start.getDate() - 56);
  const weekly = await aggregateSales(start, "week");
  res.status(200).json(weekly);
});

// ------------------------------
// 8️⃣ Monthly Sales
// ------------------------------
const getMonthlySales = asyncHandler(async (req, res) => {
  const start = new Date(new Date().getFullYear(), 0, 1);
  const monthly = await aggregateSales(start, "month");
  res.status(200).json(monthly);
});

// ------------------------------
// 9️⃣ Yearly Sales
// ------------------------------
const getYearlySales = asyncHandler(async (req, res) => {
  const start = new Date(new Date().getFullYear() - 5, 0, 1);
  const yearly = await aggregateSales(start, "year");
  res.status(200).json(yearly);
});

// ------------------------------
// 🔟 Recent Activity
// ------------------------------
const getRecentActivityLog = asyncHandler(async (req, res) => {
  const [recentOrders, recentMenus, recentReviews] = await Promise.all([
    Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select("customerName email total paymentStatus createdAt")
      .lean(),
    MenuItem.find()
      .sort({ createdAt: -1 })
      .limit(3)
      .select("name price category createdAt")
      .lean(),
    Order.aggregate([
      { $match: { "reviews.0": { $exists: true } } },
      { $unwind: "$reviews" },
      { $sort: { "reviews.createdAt": -1 } },
      { $limit: 2 },
      {
        $project: {
          reviewer: "$reviews.reviewer",
          comment: "$reviews.comment",
          rating: "$reviews.rating",
          createdAt: "$reviews.createdAt",
        },
      },
    ]),
  ]);

  res.status(200).json({ recentOrders, recentMenus, recentReviews });
});

// ------------------------------
// 1️⃣1️⃣ All Sales Trends (Daily, Weekly, Monthly, Yearly)
// ------------------------------
const getAllSalesTrends = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - 6);
  const startOfMonth = new Date(now.getFullYear(), 0, 1);
  const startOfYear = new Date(now.getFullYear() - 5, 0, 1);

  const [daily, weekly, monthly, yearly] = await Promise.all([
    aggregateSales(startOfToday, "day"),
    aggregateSales(startOfWeek, "week"),
    aggregateSales(startOfMonth, "month"),
    aggregateSales(startOfYear, "year"),
  ]);

  res.status(200).json({ daily, weekly, monthly, yearly });
});

module.exports = {
  getAnalyticsOverview,
  getOrderStats,
  getRevenueStats,
  getMenuItemStats,
  getReviewStats,
  getDailySales,
  getWeeklySales,
  getMonthlySales,
  getYearlySales,
  getRecentActivityLog,
  getAllSalesTrends,
};
