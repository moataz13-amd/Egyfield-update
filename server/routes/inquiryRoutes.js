const express = require('express');
const router = express.Router();
const {
  createInquiry,
  getInquiries,
  updateInquiryStatus,
  deleteInquiry,
} = require('../controllers/inquiryController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

// Public route
router.post('/', createInquiry);

// Admin protected routes
router.get('/', protect, requirePermission('inquiries'), getInquiries);
router.put('/:id/status', protect, requirePermission('inquiries'), updateInquiryStatus);
router.delete('/:id', protect, requirePermission('inquiries'), deleteInquiry);

module.exports = router;
