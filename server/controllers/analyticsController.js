const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inquiry = require('../models/Inquiry');
const { pool } = require('../config/db');

// @desc    Get dashboard overview stats
// @route   GET /api/admin/analytics/overview
// @access  Private
const getOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    totalCategories,
    totalInquiries,
    newInquiries,
    featuredProducts,
    thisMonthInquiries,
    lastMonthInquiries,
    thisWeekProducts,
    countries,
  ] = await Promise.all([
    Product.countDocuments(),
    Category.countDocuments(),
    Inquiry.countDocuments(),
    Inquiry.countDocuments({ status: 'new' }),
    Product.countDocuments({ featured: true }),
    Inquiry.countDocuments({ createdAt: { $gte: startOfMonth } }),
    Inquiry.countDocuments({ createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    Product.countDocuments({ createdAt: { $gte: startOfWeek } }),
    Inquiry.distinct('country'),
  ]);

  const monthChange = lastMonthInquiries > 0
    ? Math.round(((thisMonthInquiries - lastMonthInquiries) / lastMonthInquiries) * 100)
    : thisMonthInquiries > 0 ? 100 : 0;

  res.json({
    totalProducts,
    totalCategories,
    totalInquiries,
    newInquiries,
    featuredProducts,
    thisMonthInquiries,
    monthChange,
    thisWeekProducts,
    totalCountries: countries.filter(c => c && c.trim()).length,
  });
});

// @desc    Get inquiries analytics (by month, last 12 months)
// @route   GET /api/admin/analytics/inquiries
// @access  Private
const getInquiriesAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  // Group inquiries by year and month
  const monthlyDataResult = await pool.query(`
    SELECT 
      EXTRACT(YEAR FROM "createdAt")::int as year,
      EXTRACT(MONTH FROM "createdAt")::int as month,
      COUNT(*)::int as count,
      SUM(CASE WHEN status = 'new' THEN 1 ELSE 0 END)::int as "newCount",
      SUM(CASE WHEN status = 'replied' THEN 1 ELSE 0 END)::int as "repliedCount"
    FROM inquiries
    WHERE "createdAt" >= $1
    GROUP BY year, month
    ORDER BY year ASC, month ASC
  `, [startDate]);

  const monthlyData = monthlyDataResult.rows.map(r => ({
    _id: { year: r.year, month: r.month },
    count: r.count,
    newCount: r.newCount,
    repliedCount: r.repliedCount
  }));

  // Fill missing months
  const result = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = monthlyData.find(m => m._id.year === year && m._id.month === month);
    result.push({
      year,
      month,
      label: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
      count: found ? found.count : 0,
      newCount: found ? found.newCount : 0,
      repliedCount: found ? found.repliedCount : 0,
    });
  }

  // Status breakdown
  const statusResult = await pool.query('SELECT status as _id, COUNT(*)::int as count FROM inquiries GROUP BY status');
  const statusBreakdown = statusResult.rows;

  res.json({ monthly: result, statusBreakdown });
});

// @desc    Get country analytics
// @route   GET /api/admin/analytics/countries
// @access  Private
const getCountriesAnalytics = asyncHandler(async (req, res) => {
  const countriesResult = await pool.query(`
    SELECT country as _id, COUNT(*)::int as count 
    FROM inquiries 
    WHERE country IS NOT NULL AND country != '' 
    GROUP BY country 
    ORDER BY count DESC 
    LIMIT 10
  `);
  const data = countriesResult.rows;

  res.json(data.map(d => ({ country: d._id, count: d.count })));
});

// @desc    Get products analytics
// @route   GET /api/admin/analytics/products
// @access  Private
const getProductsAnalytics = asyncHandler(async (req, res) => {
  // Products per category
  const byCategoryResult = await pool.query(`
    SELECT 
      c.id as _id,
      COALESCE(c.name->>'en', 'Uncategorized') as "nameEn",
      COALESCE(c.name->>'ar', 'غير مصنف') as "nameAr",
      COALESCE(c.color, '#8B949E') as color,
      c.slug as slug,
      COUNT(p.id)::int as count,
      SUM(CASE WHEN p.featured THEN 1 ELSE 0 END)::int as "featuredCount"
    FROM categories c
    LEFT JOIN products p ON p.category = c.id
    GROUP BY c.id, c.name, c.color, c.slug
    ORDER BY count DESC
  `);
  const byCategory = byCategoryResult.rows;

  // Products added per month (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyProductsResult = await pool.query(`
    SELECT 
      EXTRACT(YEAR FROM "createdAt")::int as year,
      EXTRACT(MONTH FROM "createdAt")::int as month,
      COUNT(*)::int as count
    FROM products
    WHERE "createdAt" >= $1
    GROUP BY year, month
    ORDER BY year ASC, month ASC
  `, [sixMonthsAgo]);

  const monthlyProducts = monthlyProductsResult.rows.map(r => ({
    _id: { year: r.year, month: r.month },
    count: r.count
  }));

  // Fill missing months
  const monthlyResult = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth() + 1;
    const found = monthlyProducts.find(m => m._id.year === year && m._id.month === month);
    monthlyResult.push({
      label: d.toLocaleString('en', { month: 'short' }),
      products: found ? found.count : 0,
    });
  }

  res.json({ byCategory, monthlyProducts: monthlyResult });
});

// @desc    Get recent activity for dashboard
// @route   GET /api/admin/analytics/activity
// @access  Private
const getRecentActivity = asyncHandler(async (req, res) => {
  const [recentInquiries, recentProducts] = await Promise.all([
    Inquiry.find().sort({ createdAt: -1 }).limit(5).select('name company country status createdAt productInterest'),
    Product.find().sort({ updatedAt: -1 }).limit(5).select('name updatedAt createdAt').populate('category', 'name'),
  ]);

  // Merge and sort by time
  const activities = [];

  recentInquiries.forEach(inq => {
    activities.push({
      type: 'inquiry',
      title: `${inq.name} sent a new inquiry`,
      subtitle: inq.productInterest || 'General inquiry',
      status: inq.status,
      time: inq.createdAt,
    });
  });

  recentProducts.forEach(prod => {
    const isNew = prod.createdAt.getTime() === prod.updatedAt.getTime();
    activities.push({
      type: 'product',
      title: isNew
        ? `Product "${prod.name?.en}" was added`
        : `Product "${prod.name?.en}" was updated`,
      subtitle: prod.category?.name?.en || '',
      time: prod.updatedAt,
    });
  });

  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json(activities.slice(0, 10));
});

module.exports = {
  getOverview,
  getInquiriesAnalytics,
  getCountriesAnalytics,
  getProductsAnalytics,
  getRecentActivity,
};
