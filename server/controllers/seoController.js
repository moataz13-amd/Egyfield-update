const asyncHandler = require('express-async-handler');
const Settings = require('../models/Settings');
const SeoPage = require('../models/SeoPage');
const Product = require('../models/Product');
const Article = require('../models/Article');
const Category = require('../models/Category');

// ========================
// GLOBAL SEO SETTINGS
// ========================

const getGlobalSeo = asyncHandler(async (req, res) => {
  const settings = await Settings.findOne();
  res.json(settings?.seo || {});
});

const updateGlobalSeo = asyncHandler(async (req, res) => {
  let settings = await Settings.findOne();
  if (!settings) settings = await Settings.create({});
  settings.seo = { ...(settings.seo || {}), ...req.body };
  settings.markModified('seo');
  const updated = await settings.save();
  res.json(updated.seo);
});

// ========================
// PER-PAGE SEO
// ========================

const getSeoPages = asyncHandler(async (req, res) => {
  const { referenceType, referenceId, page } = req.query;
  const query = {};
  if (referenceType) query.referenceType = referenceType;
  if (referenceId) query.referenceId = referenceId;
  if (page) query.page = page;
  const seoPages = await SeoPage.find(query).sort({ createdAt: -1 });
  res.json(seoPages);
});

const getSeoPage = asyncHandler(async (req, res) => {
  const seoPage = await SeoPage.findById(req.params.id);
  if (!seoPage) { res.status(404); throw new Error('SEO settings not found'); }
  res.json(seoPage);
});

const createSeoPage = asyncHandler(async (req, res) => {
  const { page, title, description, keywords, ogTitle, ogDescription, ogImage,
    twitterTitle, twitterDescription, twitterImage, robots, follow,
    canonicalUrl, schemaType, breadcrumbTitle, referenceType, referenceId } = req.body;

  const exists = await SeoPage.findOne({ page, referenceType: referenceType || null, referenceId: referenceId || null });
  if (exists) {
    res.status(400);
    throw new Error('SEO settings already exist for this page. Use PUT to update.');
  }

  const seoPage = await SeoPage.create({
    page, title, description, keywords: keywords || [],
    ogTitle, ogDescription, ogImage,
    twitterTitle, twitterDescription, twitterImage,
    robots: robots || 'index', follow: follow || 'follow',
    canonicalUrl, schemaType, breadcrumbTitle, referenceType, referenceId,
  });
  res.status(201).json(seoPage);
});

const updateSeoPage = asyncHandler(async (req, res) => {
  const seoPage = await SeoPage.findById(req.params.id);
  if (!seoPage) { res.status(404); throw new Error('SEO settings not found'); }

  const fields = ['page', 'title', 'description', 'keywords', 'ogTitle', 'ogDescription',
    'ogImage', 'twitterTitle', 'twitterDescription', 'twitterImage', 'robots', 'follow',
    'canonicalUrl', 'schemaType', 'breadcrumbTitle', 'referenceType', 'referenceId'];

  fields.forEach(f => {
    if (req.body[f] !== undefined) seoPage[f] = req.body[f];
  });

  const updated = await seoPage.save();
  res.json(updated);
});

const deleteSeoPage = asyncHandler(async (req, res) => {
  const seoPage = await SeoPage.findByIdAndDelete(req.params.id);
  if (!seoPage) { res.status(404); throw new Error('SEO settings not found'); }
  res.json({ message: 'SEO settings deleted' });
});

// ========================
// SITEMAP GENERATION
// ========================

const generateSitemap = asyncHandler(async (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');

  const settings = await Settings.findOne();
  const staticPages = [
    { loc: '/', changefreq: 'weekly', priority: '1.0' },
    { loc: '/products', changefreq: 'weekly', priority: '0.9' },
    { loc: '/about', changefreq: 'monthly', priority: '0.7' },
    { loc: '/contact', changefreq: 'monthly', priority: '0.7' },
    { loc: '/articles', changefreq: 'weekly', priority: '0.6' },
  ];
  if (settings?.isPartnersActive) {
    staticPages.push({ loc: '/partners', changefreq: 'monthly', priority: '0.5' });
  }

  const products = await Product.find({ isActive: true }).select('id updatedAt').limit(500);
  const articles = await Article.find({ isActive: true }).select('slug updatedAt').limit(500);

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  for (const page of staticPages) {
    xml += `  <url>\n    <loc>${baseUrl}${page.loc}</loc>\n    <changefreq>${page.changefreq}</changefreq>\n    <priority>${page.priority}</priority>\n  </url>\n`;
  }

  for (const product of products) {
    const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : '';
    xml += `  <url>\n    <loc>${baseUrl}/products/${product.id}</loc>\n`;
    if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  for (const article of articles) {
    const lastmod = article.updatedAt ? new Date(article.updatedAt).toISOString().split('T')[0] : '';
    xml += `  <url>\n    <loc>${baseUrl}/articles/${article.slug}</loc>\n`;
    if (lastmod) xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  }

  xml += '</urlset>';
  res.header('Content-Type', 'application/xml');
  res.send(xml);
});

// ========================
// ROBOTS.TXT GENERATION
// ========================

const generateRobots = asyncHandler(async (req, res) => {
  const baseUrl = req.protocol + '://' + req.get('host');
  const settings = await Settings.findOne();
  const seo = settings?.seo || {};

  const customRobots = seo.robotsTxt;
  if (customRobots) {
    res.header('Content-Type', 'text/plain');
    return res.send(customRobots);
  }

  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${baseUrl}/sitemap.xml
`;
  res.header('Content-Type', 'text/plain');
  res.send(robots);
});

// ========================
// SEO AUDIT
// ========================

const runSeoAudit = asyncHandler(async (req, res) => {
  const issues = [];
  let technicalScore = 100;
  let contentScore = 100;
  let accessibilityScore = 100;
  let performanceScore = 100;

  // 1. Check pages
  const settings = await Settings.findOne();
  const products = await Product.find().limit(200);
  const articles = await Article.find().limit(200);
  const categories = await Category.find().limit(50);
  const seoPages = await SeoPage.find().limit(200);

  const seoMap = {};
  seoPages.forEach(sp => {
    const key = sp.referenceType ? `${sp.referenceType}:${sp.referenceId}` : sp.page;
    seoMap[key] = sp;
  });

  // Check static pages
  const staticRoutes = ['/', '/products', '/about', '/contact', '/articles'];
  if (settings?.isPartnersActive) staticRoutes.push('/partners');

  for (const route of staticRoutes) {
    const hasSeo = seoMap[route];
    if (!hasSeo || !hasSeo.title) {
      issues.push({ type: 'missing_meta', severity: 'high', page: route, message: `Missing SEO title for ${route}` });
      contentScore -= 5;
    }
    if (!hasSeo || !hasSeo.description) {
      issues.push({ type: 'missing_meta', severity: 'high', page: route, message: `Missing meta description for ${route}` });
      contentScore -= 5;
    }
  }

  // Check products SEO
  for (const product of products) {
    const key = `product:${product.id}`;
    const hasSeo = seoMap[key];
    const name = product.name?.en || product.name?.ar || 'Unnamed';
    if (!hasSeo || !hasSeo.title) {
      issues.push({ type: 'missing_meta', severity: 'medium', page: `/products/${product.id}`, message: `Missing SEO title for product: ${name}` });
      contentScore -= 2;
    }
    if (!product.images || product.images.length === 0) {
      issues.push({ type: 'missing_image', severity: 'low', page: `/products/${product.id}`, message: `Missing images for product: ${name}` });
      contentScore -= 1;
    }
  }

  // Check articles SEO
  for (const article of articles) {
    const key = `article:${article.id}`;
    const hasSeo = seoMap[key];
    const title = article.title?.en || article.title?.ar || 'Untitled';
    if (!hasSeo || !hasSeo.title) {
      issues.push({ type: 'missing_meta', severity: 'medium', page: `/articles/${article.slug}`, message: `Missing SEO title for article: ${title}` });
      contentScore -= 2;
    }
    if (!article.image?.url) {
      issues.push({ type: 'missing_image', severity: 'low', page: `/articles/${article.slug}`, message: `Missing featured image for article: ${title}` });
      contentScore -= 1;
    }
  }

  // Check categories SEO
  for (const cat of categories) {
    const key = `category:${cat.id}`;
    const hasSeo = seoMap[key];
    const catName = cat.name?.en || cat.name?.ar || 'Unnamed';
    if (!hasSeo || !hasSeo.title) {
      issues.push({ type: 'missing_meta', severity: 'low', page: `/products?category=${cat.id}`, message: `Missing SEO title for category: ${catName}` });
      contentScore -= 1;
    }
  }

  // Check global SEO
  if (!settings?.seo?.metaTitle && !settings?.seo?.metaDescription) {
    issues.push({ type: 'missing_global_seo', severity: 'high', page: 'global', message: 'Global SEO settings not configured' });
    technicalScore -= 10;
  }

  // Check sitemap
  issues.push({ type: 'info', severity: 'info', page: 'global', message: `Sitemap available at /sitemap.xml — ${products.length} products, ${articles.length} articles` });

  // Accessibility checks
  if (!settings?.seo?.metaTitle) {
    issues.push({ type: 'missing_title', severity: 'high', page: 'global', message: 'Website missing a default meta title' });
    accessibilityScore -= 5;
  }

  // Performance deduction for missing image alts in products
  const productsWithoutAlts = products.filter(p => !p.name?.en).length;
  if (productsWithoutAlts > 0) {
    performanceScore -= Math.min(productsWithoutAlts, 10);
  }

  // Clamp scores
  const clamp = (v) => Math.max(0, Math.min(100, v));
  technicalScore = clamp(technicalScore);
  contentScore = clamp(contentScore);
  accessibilityScore = clamp(accessibilityScore);
  performanceScore = clamp(performanceScore);

  const overallScore = Math.round((technicalScore + contentScore + accessibilityScore + performanceScore) / 4);

  res.json({
    score: overallScore,
    technicalScore,
    contentScore,
    accessibilityScore,
    performanceScore,
    issues,
    summary: {
      totalIssues: issues.length,
      highSeverity: issues.filter(i => i.severity === 'high').length,
      mediumSeverity: issues.filter(i => i.severity === 'medium').length,
      lowSeverity: issues.filter(i => i.severity === 'low').length,
    },
    timestamp: new Date().toISOString(),
  });
});

const getSeoAnalysis = asyncHandler(async (req, res) => {
  const products = await Product.find().limit(500);
  const articles = await Article.find().limit(500);
  const categories = await Category.find().limit(100);
  const seoPages = await SeoPage.find().limit(500);

  const analysis = {
    totalProducts: products.length,
    productsWithSeo: 0,
    totalArticles: articles.length,
    articlesWithSeo: 0,
    totalCategories: categories.length,
    categoriesWithSeo: 0,
    totalSeoPages: seoPages.length,
    missingTitles: 0,
    missingDescriptions: 0,
    duplicateTitles: {},
  };

  const titleMap = {};
  const descMap = {};

  for (const sp of seoPages) {
    if (sp.title) {
      titleMap[sp.title] = (titleMap[sp.title] || 0) + 1;
      if (sp.referenceType === 'product') analysis.productsWithSeo++;
      else if (sp.referenceType === 'article') analysis.articlesWithSeo++;
      else if (sp.referenceType === 'category') analysis.categoriesWithSeo++;
    } else {
      analysis.missingTitles++;
    }
    if (!sp.description) analysis.missingDescriptions++;
    if (sp.description) {
      descMap[sp.description] = (descMap[sp.description] || 0) + 1;
    }
  }

  analysis.duplicateTitles = Object.fromEntries(
    Object.entries(titleMap).filter(([, count]) => count > 1)
  );
  analysis.duplicateDescriptions = Object.fromEntries(
    Object.entries(descMap).filter(([, count]) => count > 1)
  );

  res.json(analysis);
});

module.exports = {
  getGlobalSeo, updateGlobalSeo,
  getSeoPages, getSeoPage, createSeoPage, updateSeoPage, deleteSeoPage,
  generateSitemap, generateRobots,
  runSeoAudit, getSeoAnalysis,
};
