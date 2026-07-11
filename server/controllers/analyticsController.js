const asyncHandler = require('express-async-handler');
const { supabase } = require('../config/db');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Inquiry = require('../models/Inquiry');

const getOverview = asyncHandler(async (req, res) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);

  const [
    totalProducts, totalCategories, totalInquiries, newInquiries,
    featuredProducts, thisMonthInquiries, lastMonthInquiries, thisWeekProducts, countries,
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
    totalProducts, totalCategories, totalInquiries, newInquiries,
    featuredProducts, thisMonthInquiries, monthChange, thisWeekProducts,
    totalCountries: countries.filter(c => c && c.trim()).length,
  });
});

const getInquiriesAnalytics = asyncHandler(async (req, res) => {
  const now = new Date();
  const startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);

  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('createdAt, status')
    .gte('createdAt', startDate.toISOString());

  const inquiriesList = inquiries || [];

  const monthlyMap = {};
  const statusCounts = {};

  for (const inq of inquiriesList) {
    const d = new Date(inq.createdAt);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    if (!monthlyMap[key]) monthlyMap[key] = { year: d.getFullYear(), month: d.getMonth() + 1, count: 0, newCount: 0, repliedCount: 0 };
    monthlyMap[key].count++;
    if (inq.status === 'new') monthlyMap[key].newCount++;
    if (inq.status === 'replied') monthlyMap[key].repliedCount++;

    statusCounts[inq.status || 'unknown'] = (statusCounts[inq.status || 'unknown'] || 0) + 1;
  }

  const monthly = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
    const found = monthlyMap[key];
    monthly.push({
      year: d.getFullYear(), month: d.getMonth() + 1,
      label: d.toLocaleString('en', { month: 'short', year: '2-digit' }),
      count: found ? found.count : 0,
      newCount: found ? found.newCount : 0,
      repliedCount: found ? found.repliedCount : 0,
    });
  }

  const statusBreakdown = Object.entries(statusCounts).map(([status, count]) => ({ _id: status, count }));

  res.json({ monthly, statusBreakdown });
});

const getCountriesAnalytics = asyncHandler(async (req, res) => {
  const { data: inquiries } = await supabase
    .from('inquiries')
    .select('country')
    .not('country', 'is', null)
    .neq('country', '');

  const countryMap = {};
  for (const inq of inquiries || []) {
    countryMap[inq.country] = (countryMap[inq.country] || 0) + 1;
  }

  const data = Object.entries(countryMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([country, count]) => ({ country, count }));

  res.json(data);
});

const getProductsAnalytics = asyncHandler(async (req, res) => {
  const [categories, products] = await Promise.all([
    supabase.from('categories').select('*'),
    supabase.from('products').select('id, category, featured, createdAt'),
  ]);

  const productsList = products.data || [];
  const categoriesList = categories.data || [];

  const byCategory = categoriesList.map(c => {
    const catProducts = productsList.filter(p => p.category === c.id);
    return {
      _id: c.id,
      nameEn: c.name?.en || 'Uncategorized',
      nameAr: c.name?.ar || 'غير مصنف',
      color: c.color || '#8B949E',
      slug: c.slug,
      count: catProducts.length,
      featuredCount: catProducts.filter(p => p.featured).length,
    };
  }).sort((a, b) => b.count - a.count);

  const now = new Date();
  const monthlyMap = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthlyMap[`${d.getFullYear()}-${d.getMonth() + 1}`] = { label: d.toLocaleString('en', { month: 'short' }), products: 0 };
  }

  for (const p of productsList) {
    const d = new Date(p.createdAt);
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
    if (d >= sixMonthsAgo) {
      const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
      if (monthlyMap[key]) monthlyMap[key].products++;
    }
  }

  res.json({ byCategory, monthlyProducts: Object.values(monthlyMap) });
});

const getRecentActivity = asyncHandler(async (req, res) => {
  const [recentInquiries, recentProducts] = await Promise.all([
    Inquiry.find().sort({ createdAt: -1 }).limit(5).select('name company country status createdAt productInterest'),
    Product.find().sort({ updatedAt: -1 }).limit(5).select('name updatedAt createdAt').populate('category', 'name'),
  ]);

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
    const isNew = new Date(prod.createdAt).getTime() === new Date(prod.updatedAt).getTime();
    activities.push({
      type: 'product',
      title: isNew ? `Product "${prod.name?.en}" was added` : `Product "${prod.name?.en}" was updated`,
      subtitle: prod.category?.name?.en || '',
      time: prod.updatedAt,
    });
  });

  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  res.json(activities.slice(0, 10));
});

module.exports = { getOverview, getInquiriesAnalytics, getCountriesAnalytics, getProductsAnalytics, getRecentActivity };
