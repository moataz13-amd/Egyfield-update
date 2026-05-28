const express = require('express');
const router = express.Router();
const { getAboutContent, updateAboutContent } = require('../controllers/aboutController');
const { protect } = require('../middleware/authMiddleware');

// Public route — used by frontend About page
router.get('/', getAboutContent);

// Admin route — update about content
router.put('/', protect, updateAboutContent);

module.exports = router;
