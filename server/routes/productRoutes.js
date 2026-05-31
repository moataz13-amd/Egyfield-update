const express = require('express');
const router = express.Router();
const {
  getProducts,
  getFeaturedProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleFeatured,
  toggleActive,
} = require('../controllers/productController');
const { protect, requirePermission } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Multer error handling wrapper
const handleUpload = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err) {
      console.error('Product image upload error:', err);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    next();
  });
};

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProduct);

// Admin protected routes
router.post('/', protect, requirePermission('products'), handleUpload(upload.array('images', 5)), createProduct);
router.put('/:id', protect, requirePermission('products'), handleUpload(upload.array('images', 5)), updateProduct);
router.patch('/:id/featured', protect, requirePermission('products'), toggleFeatured);
router.patch('/:id/active', protect, requirePermission('products'), toggleActive);
router.delete('/:id', protect, requirePermission('products'), deleteProduct);

module.exports = router;
