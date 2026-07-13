const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleActiveCategory,
} = require('../controllers/categoryController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCategories);
router.get('/:slug/products', getCategoryProducts);

// Admin protected routes
router.post('/', protect, requirePermission('products'), createCategory);
router.put('/:id', protect, requirePermission('products'), updateCategory);
router.patch('/:id/toggle', protect, requirePermission('products'), toggleActiveCategory);
router.delete('/:id', protect, requirePermission('products'), deleteCategory);

module.exports = router;
