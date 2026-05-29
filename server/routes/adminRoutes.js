const express = require('express');
const router = express.Router();
const {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
} = require('../controllers/adminController');
const { protect, requirePermission } = require('../middleware/authMiddleware');

// Protect all routes under this router with admins permission
router.use(protect, requirePermission('admins'));

router.route('/')
  .get(getAdmins)
  .post(createAdmin);

router.route('/:id')
  .put(updateAdmin)
  .delete(deleteAdmin);

module.exports = router;
