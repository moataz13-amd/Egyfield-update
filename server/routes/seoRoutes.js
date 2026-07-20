const express = require('express');
const router = express.Router();
const {
  getGlobalSeo, updateGlobalSeo,
  getSeoPages, getSeoPage, createSeoPage, updateSeoPage, deleteSeoPage,
  generateSitemap, generateRobots,
  runSeoAudit, getSeoAnalysis, analyzeSeo,
} = require('../controllers/seoController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

// Global SEO (admin)
router.get('/global', protect, requirePermission('settings'), getGlobalSeo);
router.put('/global', protect, requirePermission('settings'), updateGlobalSeo);

// Per-page SEO (admin)
router.route('/pages')
  .get(protect, requirePermission('settings'), getSeoPages)
  .post(protect, requirePermission('settings'), createSeoPage);

router.route('/pages/:id')
  .get(protect, requirePermission('settings'), getSeoPage)
  .put(protect, requirePermission('settings'), updateSeoPage)
  .delete(protect, requirePermission('settings'), deleteSeoPage);

// SEO Audit (admin)
router.get('/audit', protect, runSeoAudit);
router.get('/analysis', protect, getSeoAnalysis);
router.post('/analyze', protect, analyzeSeo);

module.exports = router;
