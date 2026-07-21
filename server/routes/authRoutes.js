const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin, getMe, changePassword, debugAuth, seedAdmin } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.post('/seed', seedAdmin);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);
router.get('/debug', debugAuth);

module.exports = router;
