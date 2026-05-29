const asyncHandler = require('express-async-handler');
const Article = require('../models/Article');
const cloudinary = require('../config/cloudinary');

// Helper to generate unique slug
const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start of text
    .replace(/-+$/, ''); // Trim - from end of text
};

// @desc    Get all articles (with pagination, search, status filter)
// @route   GET /api/articles
// @access  Public
const getArticles = asyncHandler(async (req, res) => {
  const { search, page = 1, limit = 9, admin = 'false' } = req.query;

  const query = {};
  if (admin !== 'true') {
    query.isActive = true;
  }

  if (search) {
    query.$or = [
      { 'title.en': { $regex: search, $options: 'i' } },
      { 'title.ar': { $regex: search, $options: 'i' } },
      { 'summary.en': { $regex: search, $options: 'i' } },
      { 'summary.ar': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [articles, total] = await Promise.all([
    Article.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Article.countDocuments(query),
  ]);

  res.json({
    articles,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc    Get single article by slug
// @route   GET /api/articles/slug/:slug
// @access  Public
const getArticleBySlug = asyncHandler(async (req, res) => {
  const article = await Article.findOne({ slug: req.params.slug, isActive: true });

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  // Increment views
  article.views += 1;
  await article.save();

  res.json(article);
});

// @desc    Get single article by ID
// @route   GET /api/articles/:id
// @access  Private (Admin)
const getArticleById = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  res.json(article);
});

// @desc    Create article
// @route   POST /api/articles
// @access  Private (Admin)
const createArticle = asyncHandler(async (req, res) => {
  const { title, content, summary, isActive } = req.body;

  let parsedTitle, parsedContent, parsedSummary;
  try {
    parsedTitle = typeof title === 'string' ? JSON.parse(title) : title;
    parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    parsedSummary = typeof summary === 'string' ? JSON.parse(summary) : summary;
  } catch (err) {
    res.status(400);
    throw new Error('Invalid JSON format for multilingual fields');
  }

  const englishTitle = parsedTitle?.en || parsedTitle?.ar || 'untitled';
  let baseSlug = slugify(englishTitle) || 'article';
  
  // Make sure slug is unique
  let slug = baseSlug;
  let count = 1;
  while (await Article.findOne({ slug })) {
    slug = `${baseSlug}-${count}`;
    count++;
  }

  let image = { url: '', publicId: '' };
  if (req.file) {
    image = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const article = await Article.create({
    title: parsedTitle,
    content: parsedContent,
    summary: parsedSummary,
    image,
    slug,
    isActive: isActive === 'true' || isActive === true,
  });

  res.status(201).json(article);
});

// @desc    Update article
// @route   PUT /api/articles/:id
// @access  Private (Admin)
const updateArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  const { title, content, summary, isActive } = req.body;

  let parsedTitle, parsedContent, parsedSummary;
  try {
    parsedTitle = typeof title === 'string' ? JSON.parse(title) : title;
    parsedContent = typeof content === 'string' ? JSON.parse(content) : content;
    parsedSummary = typeof summary === 'string' ? JSON.parse(summary) : summary;
  } catch (err) {
    res.status(400);
    throw new Error('Invalid JSON format for multilingual fields');
  }

  // Update slug if English title has changed
  if (parsedTitle?.en && parsedTitle.en !== article.title.en) {
    let baseSlug = slugify(parsedTitle.en) || 'article';
    let slug = baseSlug;
    let count = 1;
    while (await Article.findOne({ slug, _id: { $ne: article._id } })) {
      slug = `${baseSlug}-${count}`;
      count++;
    }
    article.slug = slug;
  }

  article.title = parsedTitle || article.title;
  article.content = parsedContent || article.content;
  article.summary = parsedSummary || article.summary;
  article.isActive = isActive !== undefined ? (isActive === 'true' || isActive === true) : article.isActive;

  if (req.file) {
    // Delete old image if exists
    if (article.image?.publicId) {
      await cloudinary.uploader.destroy(article.image.publicId).catch((err) => {
        console.error('Failed to delete old image from Cloudinary:', err);
      });
    }

    article.image = {
      url: req.file.path,
      publicId: req.file.filename,
    };
  }

  const updatedArticle = await article.save();
  res.json(updatedArticle);
});

// @desc    Delete article
// @route   DELETE /api/articles/:id
// @access  Private (Admin)
const deleteArticle = asyncHandler(async (req, res) => {
  const article = await Article.findById(req.params.id);

  if (!article) {
    res.status(404);
    throw new Error('Article not found');
  }

  // Delete image from Cloudinary
  if (article.image?.publicId) {
    await cloudinary.uploader.destroy(article.image.publicId).catch((err) => {
      console.error('Failed to delete image from Cloudinary:', err);
    });
  }

  await article.deleteOne();
  res.json({ message: 'Article removed' });
});

module.exports = {
  getArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
};
