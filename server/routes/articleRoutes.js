const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const {
  getArticles,
  getArticleBySlug,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/articleController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

// Dedicated article image upload (stored in egyfield/articles)
const articleStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'egyfield/articles',
    format: async () => 'webp',
    transformation: [{ width: 1200, crop: 'limit', quality: 'auto' }],
  },
});

const articleUpload = multer({
  storage: articleStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Multer error handling wrapper
const handleUpload = (req, res, next) => {
  articleUpload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Article image upload error:', err);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    next();
  });
};

// Public routes
router.get('/', getArticles);
router.get('/slug/:slug', getArticleBySlug);

// Admin protected routes
router.get('/:id', protect, requirePermission('articles'), getArticleById);
router.post('/', protect, requirePermission('articles'), handleUpload, createArticle);
router.put('/:id', protect, requirePermission('articles'), handleUpload, updateArticle);
router.delete('/:id', protect, requirePermission('articles'), deleteArticle);

module.exports = router;
