const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inquiry = require('../models/Inquiry');

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

  const monthlyData = await Inquiry.aggregate([
    { $match: { createdAt: { $gte: startDate } } },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        count: { $sum: 1 },
        newCount: {
          $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] },
        },
        repliedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] },
        },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

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
  const statusBreakdown = await Inquiry.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);

  res.json({ monthly: result, statusBreakdown });
});

// @desc    Get country analytics
// @route   GET /api/admin/analytics/countries
// @access  Private
const getCountriesAnalytics = asyncHandler(async (req, res) => {
  const data = await Inquiry.aggregate([
    { $match: { country: { $ne: '', $exists: true } } },
    { $group: { _id: '$country', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.json(data.map(d => ({ country: d._id, count: d.count })));
});

// @desc    Get products analytics
// @route   GET /api/admin/analytics/products
// @access  Private
const getProductsAnalytics = asyncHandler(async (req, res) => {
  // Products per category
  const byCategory = await Product.aggregate([
    {
      $group: {
        _id: '$category',
        count: { $sum: 1 },
        featuredCount: { $sum: { $cond: ['$featured', 1, 0] } },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    { $unwind: { path: '$category', preserveNullAndEmptyArrays: true } },
    {
      $project: {
        nameEn: { $ifNull: ['$category.name.en', 'Uncategorized'] },
        nameAr: { $ifNull: ['$category.name.ar', 'غير مصنف'] },
        color: { $ifNull: ['$category.color', '#8B949E'] },
        slug: '$category.slug',
        count: 1,
        featuredCount: 1,
      },
    },
    { $sort: { count: -1 } },
  ]);

  // Products added per month (last 6 months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyProducts = await Product.aggregate([
    { $match: { createdAt: { $gte: sixMonthsAgo } } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

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
