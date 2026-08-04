const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const { 
  getSettings, 
  updateSettings, 
  updateHeroImage, 
  deleteHeroImage,
  addHeroImage,
  deleteSliderImage,
  uploadPageCoverImage,
  deletePageCoverImage
} = require('../controllers/settingsController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

// Dedicated hero image upload (separate folder, higher resolution)
const heroStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'deltaharvest/hero',
    format: async () => 'webp',
    transformation: [{ width: 1920, crop: 'limit', quality: 'auto:best' }],
  },
});

const heroUpload = multer({
  storage: heroStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB for hero
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

router.use(protect, requirePermission('settings'));

router.get('/', getSettings);
router.put('/', updateSettings);

// Hero image upload with error handling
router.put('/hero-image', (req, res, next) => {
  heroUpload.single('heroImage')(req, res, (err) => {
    if (err) {
      console.error('Hero image upload error:', err);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    next();
  });
}, updateHeroImage);

router.delete('/hero-image', deleteHeroImage);

// Multiple hero images routes
router.post('/hero-images', (req, res, next) => {
  heroUpload.single('heroImage')(req, res, (err) => {
    if (err) {
      console.error('Slider image upload error:', err);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    next();
  });
}, addHeroImage);

router.delete('/hero-images', deleteSliderImage);

// Page cover image upload/delete
router.put('/page-cover-image', (req, res, next) => {
  heroUpload.single('coverImage')(req, res, (err) => {
    if (err) {
      console.error('Page cover image upload error:', err);
      return res.status(400).json({ message: err.message || 'Image upload failed' });
    }
    next();
  });
}, uploadPageCoverImage);

router.delete('/page-cover-image', deletePageCoverImage);

module.exports = router;
