const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// @desc    Login admin
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Please provide email and password');
  }

  const admin = await Admin.findOne({ email }).select('+password');

  if (!admin) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await admin.comparePassword(password);

  if (!isMatch) {
    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    _id: admin._id,
    username: admin.username,
    email: admin.email,
    token: generateToken(admin._id),
  });
});

// @desc    Register admin (first-time setup only)
// @route   POST /api/auth/register
// @access  Public (restricted - only if no admins exist)
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  // Only allow registration if no admins exist
  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    res.status(403);
    throw new Error('Admin already exists. Registration is disabled.');
  }

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide all fields');
  }

  const admin = await Admin.create({ username, email, password });

  res.status(201).json({
    _id: admin._id,
    username: admin.username,
    email: admin.email,
    token: generateToken(admin._id),
  });
});

// @desc    Get current admin profile
// @route   GET /api/auth/me
// @access  Private
const getMe = asyncHandler(async (req, res) => {
  res.json(req.admin);
});

// @desc    Change admin password
// @route   POST /api/auth/change-password
// @access  Private
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    res.status(400);
    throw new Error('Please provide current and new passwords');
  }

  if (newPassword.length < 6) {
    res.status(400);
    throw new Error('New password must be at least 6 characters');
  }

  const admin = await Admin.findById(req.admin._id).select('+password');
  const isMatch = await admin.comparePassword(currentPassword);

  if (!isMatch) {
    res.status(401);
    throw new Error('Current password is incorrect');
  }

  admin.password = newPassword;
  await admin.save();

  res.json({ message: 'Password updated successfully' });
});

module.exports = { loginAdmin, registerAdmin, getMe, changePassword };
