const express = require('express');
const router = express.Router();
const {
  getCategories,
  getCategoryProducts,
  createCategory,
  updateCategory,
  deleteCategory,
} = require('../controllers/categoryController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getCategories);
router.get('/:slug/products', getCategoryProducts);

// Admin protected routes
router.post('/', protect, createCategory);
router.put('/:id', protect, updateCategory);
router.delete('/:id', protect, deleteCategory);

module.exports = router;
