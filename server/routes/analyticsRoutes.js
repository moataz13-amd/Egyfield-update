const express = require('express');
const router = express.Router();
const {
  getOverview,
  getInquiriesAnalytics,
  getCountriesAnalytics,
  getProductsAnalytics,
  getRecentActivity,
} = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/overview', getOverview);
router.get('/inquiries', getInquiriesAnalytics);
router.get('/countries', getCountriesAnalytics);
router.get('/products', getProductsAnalytics);
router.get('/activity', getRecentActivity);

module.exports = router;
