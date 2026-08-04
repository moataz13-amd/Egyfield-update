const express = require('express');
const router = express.Router();
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');
const {
  getPartners,
  getPartnerById,
  createPartner,
  updatePartner,
  deletePartner,
} = require('../controllers/partnerController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

const partnerStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'deltaharvest/partners',
    format: async () => 'png', // Logos are usually transparent, PNG is preferred
    transformation: [{ width: 400, height: 400, crop: 'limit', quality: 'auto' }],
  },
});

const partnerUpload = multer({
  storage: partnerStorage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

const handleUpload = (req, res, next) => {
  partnerUpload.single('logo')(req, res, (err) => {
    if (err) {
      console.error('Partner logo upload error:', err);
      return res.status(400).json({ message: err.message || 'Logo upload failed' });
    }
    next();
  });
};

// Public route
router.get('/', getPartners);

// Admin routes
router.get('/:id', protect, requirePermission('settings'), getPartnerById);
router.post('/', protect, requirePermission('settings'), handleUpload, createPartner);
router.put('/:id', protect, requirePermission('settings'), handleUpload, updatePartner);
router.delete('/:id', protect, requirePermission('settings'), deletePartner);

module.exports = router;
