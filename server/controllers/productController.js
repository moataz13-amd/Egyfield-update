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
      { 'description.en': { $regex: search, $options: 'i' } },
      { 'description.ar': { $regex: search, $options: 'i' } },
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
  const { nameAr, nameEn, descriptionAr, descriptionEn, category, origin, packaging, season, certifications, featured, isActive } = req.body;

  const images = req.files
    ? req.files.map((file) => ({
        url: file.path,
        publicId: file.filename,
      }))
    : [];

  const product = await Product.create({
    name: { ar: nameAr, en: nameEn },
    description: { ar: descriptionAr, en: descriptionEn },
    category,
    images,
    origin: origin || 'Egypt',
    packaging: packaging || '',
    season: season || 'Year-round',
    certifications: certifications ? JSON.parse(certifications) : [],
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

  const { nameAr, nameEn, descriptionAr, descriptionEn, category, origin, packaging, season, certifications, featured, isActive, removeImages } = req.body;

  // Remove specified images from Cloudinary
  if (removeImages) {
    const toRemove = JSON.parse(removeImages);
    for (const publicId of toRemove) {
      await cloudinary.uploader.destroy(publicId);
    }
    product.images = product.images.filter((img) => !toRemove.includes(img.publicId));
  }

  // Add new images
  if (req.files && req.files.length > 0) {
    const newImages = req.files.map((file) => ({
      url: file.path,
      publicId: file.filename,
    }));
    product.images.push(...newImages);
  }

  if (nameAr) product.name.ar = nameAr;
  if (nameEn) product.name.en = nameEn;
  if (descriptionAr) product.description.ar = descriptionAr;
  if (descriptionEn) product.description.en = descriptionEn;
  if (category) product.category = category;
  if (origin) product.origin = origin;
  if (packaging !== undefined) product.packaging = packaging;
  if (season) product.season = season;
  if (certifications) product.certifications = JSON.parse(certifications);
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
