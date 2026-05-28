const express = require('express');
const router = express.Router();
const { loginAdmin, registerAdmin, getMe, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/login', loginAdmin);
router.post('/register', registerAdmin);
router.get('/me', protect, getMe);
router.post('/change-password', protect, changePassword);

module.exports = router;
