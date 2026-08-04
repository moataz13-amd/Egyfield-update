const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const { protect } = require('../middleware/authMiddleware');

router.get('/upload-params', protect, (req, res) => {
  const timestamp = Math.round(Date.now() / 1000);
  const folder = 'deltaharvest/uploads';
  const params = { timestamp, folder };
  const signature = cloudinary.utils.api_sign_request(params, process.env.CLOUDINARY_API_SECRET);
  res.json({
    timestamp,
    signature,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder,
  });
});

module.exports = router;
