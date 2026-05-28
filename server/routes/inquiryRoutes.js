const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { protect } = require('../middleware/authMiddleware');

// Public route
router.post('/', createInquiry);

// Admin protected routes
router.get('/', protect, getInquiries);
router.put('/:id/status', protect, updateInquiryStatus);
router.delete('/:id', protect, deleteInquiry);

module.exports = router;
