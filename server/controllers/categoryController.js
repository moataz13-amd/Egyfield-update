const asyncHandler = require('express-async-handler');
const Category = require('../models/Category');
const Product = require('../models/Product');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { admin } = req.query;

  const query = {};
  if (admin !== 'true') {
    query.isActive = true;
  }

  const categories = await Category.find(query).sort({ createdAt: 1 });

  // Get product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (cat) => {
      const count = await Product.countDocuments({ category: cat._id, isActive: true });
      return { ...cat.toObject(), productCount: count };
    })
  );

  res.json(categoriesWithCount);
});

// @desc    Get products by category slug
// @route   GET /api/categories/:slug/products
// @access  Public
const getCategoryProducts = asyncHandler(async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { page = 1, limit = 12 } = req.query;
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const [products, total] = await Promise.all([
    Product.find({ category: category._id, isActive: true })
      .populate('category', 'name slug icon color')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    Product.countDocuments({ category: category._id, isActive: true }),
  ]);

  res.json({
    category,
    products,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    total,
  });
});

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin)
const createCategory = asyncHandler(async (req, res) => {
  const { name, slug, icon, color } = req.body;

  const exists = await Category.findOne({ slug });
  if (exists) {
    res.status(400);
    throw new Error('Category with this slug already exists');
  }

  const category = await Category.create({
    name: name || { en: '', ar: '' },
    slug,
    icon: icon || '',
    color: color || '#7BB445',
    isActive: true,
  });

  res.status(201).json(category);
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin)
const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  const { name, slug, icon, color, isActive } = req.body;

  if (name) {
    if (name.en !== undefined) category.name.en = name.en;
    if (name.ar !== undefined) category.name.ar = name.ar;
  }
  if (slug) category.slug = slug;
  if (icon) category.icon = icon;
  if (color) category.color = color;
  if (isActive !== undefined) category.isActive = isActive;

  const updatedCategory = await category.save();
  res.json(updatedCategory);
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  // Check if products exist in this category
  const productCount = await Product.countDocuments({ category: category._id });
  if (productCount > 0) {
    res.status(400);
    throw new Error(`Cannot delete category with ${productCount} products. Remove or reassign products first.`);
  }

  await Category.findByIdAndDelete(req.params.id);
  res.json({ message: 'Category deleted successfully' });
});

// @desc    Toggle category active status
// @route   PATCH /api/categories/:id/toggle
// @access  Private (Admin)
const toggleActiveCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    res.status(404);
    throw new Error('Category not found');
  }

  category.isActive = !category.isActive;
  const updated = await category.save();

  res.json(updated);
});

module.exports = {
  getCategories,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleActiveCategory,
};
