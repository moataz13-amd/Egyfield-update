const asyncHandler = require('express-async-handler');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// @desc    Get all products (with filters, search, pagination)
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, page = 1, limit = 12, featured, all } = req.query;

  const query = {};
  if (all !== 'true') {
    query.isActive = true;
  }

  if (category) {
    query.category = category;
  }

  if (featured === 'true') {
    query.featured = true;
  }

  if (search) {
    query.$or = [
      { 'name.en': { $regex: search, $options: 'i' } },
      { 'name.ar': { $regex: search, $options: 'i' } },
      { 'name.fr': { $regex: search, $options: 'i' } },
      { 'name.it': { $regex: search, $options: 'i' } },
      { 'name.tr': { $regex: search, $options: 'i' } },
      { 'description.en': { $regex: search, $options: 'i' } },
      { 'description.ar': { $regex: search, $options: 'i' } },
      { 'description.fr': { $regex: search, $options: 'i' } },
      { 'description.it': { $regex: search, $options: 'i' } },
      { 'description.tr': { $regex: search, $options: 'i' } },
    ];
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug icon color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments(query),
  ]);

  res.json({
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await Product.find({ featured: true, isActive: true })
    .populate('category', 'name slug icon color')
    .sort({ createdAt: -1 })
    .limit(6);

  res.json(products);
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).populate('category', 'name slug icon color');

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// @desc    Create product
// @route   POST /api/products
// @access  Private (Admin)
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, origin, packaging, season, certifications, featured, isActive, imagesData, specifications, faq } = req.body;

  const images = imagesData
    ? (typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData)
    : req.files
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
        }))
      : [];

  const product = await Product.create({
    name: typeof name === 'string' ? JSON.parse(name) : name || {},
    description: typeof description === 'string' ? JSON.parse(description) : description || {},
    origin: typeof origin === 'string' ? JSON.parse(origin) : origin || {},
    packaging: typeof packaging === 'string' ? JSON.parse(packaging) : packaging || {},
    season: typeof season === 'string' ? JSON.parse(season) : season || {},
    category,
    images,
    certifications: certifications ? JSON.parse(certifications) : [],
    specifications: specifications ? (typeof specifications === 'string' ? JSON.parse(specifications) : specifications) : [],
    faq: faq ? (typeof faq === 'string' ? JSON.parse(faq) : faq) : [],
    featured: featured === 'true',
    isActive: isActive === undefined ? true : (isActive === 'true' || isActive === true),
  });

  const populatedProduct = await Product.findById(product._id).populate('category', 'name slug icon color');

  res.status(201).json(populatedProduct);
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin)
const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const { name, description, category, origin, packaging, season, certifications, featured, isActive, removeImages, imagesData, specifications, faq } = req.body;

  // Remove specified images from Cloudinary
  if (removeImages) {
    const toRemove = JSON.parse(removeImages);
    for (const publicId of toRemove) {
      await cloudinary.uploader.destroy(publicId);
    }
    product.images = product.images.filter((img) => !toRemove.includes(img.publicId));
  }

  // Add new images (direct upload JSON or multer files)
  const newImages = imagesData
    ? (typeof imagesData === 'string' ? JSON.parse(imagesData) : imagesData)
    : req.files && req.files.length > 0
      ? req.files.map((file) => ({
          url: file.path,
          publicId: file.filename,
        }))
      : [];
  if (newImages.length > 0) {
    product.images.push(...newImages);
  }

  if (name) product.name = typeof name === 'string' ? JSON.parse(name) : name;
  if (description) product.description = typeof description === 'string' ? JSON.parse(description) : description;
  if (category) product.category = category;
  if (origin) product.origin = typeof origin === 'string' ? JSON.parse(origin) : origin;
  if (packaging !== undefined) product.packaging = typeof packaging === 'string' ? JSON.parse(packaging) : packaging;
  if (season) product.season = typeof season === 'string' ? JSON.parse(season) : season;
  if (certifications) product.certifications = typeof certifications === 'string' ? JSON.parse(certifications) : certifications;
  if (specifications) product.specifications = typeof specifications === 'string' ? JSON.parse(specifications) : specifications;
  if (faq) product.faq = typeof faq === 'string' ? JSON.parse(faq) : faq;
  if (featured !== undefined) product.featured = featured === 'true' || featured === true;
  if (isActive !== undefined) product.isActive = isActive === 'true' || isActive === true;

  const updatedProduct = await product.save();
  const populatedProduct = await Product.findById(updatedProduct._id).populate('category', 'name slug icon color');

  res.json(populatedProduct);
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images from Cloudinary
  for (const image of product.images) {
    if (image.publicId) {
      await cloudinary.uploader.destroy(image.publicId);
    }
  }

  await Product.findByIdAndDelete(req.params.id);

  res.json({ message: 'Product deleted successfully' });
});

// @desc    Toggle product featured status
// @route   PATCH /api/products/:id/featured
// @access  Private (Admin)
const toggleFeatured = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.featured = !product.featured;
  await product.save();

  res.json({ featured: product.featured });
});

// @desc    Toggle product active status
// @route   PATCH /api/products/:id/active
// @access  Private (Admin)
const toggleActive = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  product.isActive = !product.isActive;
  await product.save();

  res.json({ isActive: product.isActive });
});

module.exports = {
  getProducts,
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
  toggleActive,
};
