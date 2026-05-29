const asyncHandler = require('express-async-handler');
const Admin = require('../models/Admin');

// @desc    Get all admins
// @route   GET /api/admin/accounts
// @access  Private (admins permission required)
const getAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
  res.json(admins);
});

// @desc    Create a new admin account
// @route   POST /api/admin/accounts
// @access  Private (admins permission required)
const createAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, role, permissions } = req.body;

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please fill in all required fields');
  }

  // Check if admin already exists by email
  const emailExists = await Admin.findOne({ email });
  if (emailExists) {
    res.status(400);
    throw new Error('An administrator with this email already exists');
  }

  // Check if username exists
  const usernameExists = await Admin.findOne({ username });
  if (usernameExists) {
    res.status(400);
    throw new Error('This username is already taken');
  }

  const admin = await Admin.create({
    username,
    email,
    password,
    role: role || 'admin',
    permissions: permissions || ['products', 'articles', 'inquiries', 'settings']
  });

  res.status(201).json({
    _id: admin._id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions
  });
});

// @desc    Update admin account
// @route   PUT /api/admin/accounts/:id
// @access  Private (admins permission required)
const updateAdmin = asyncHandler(async (req, res) => {
  const { username, email, password, role, permissions } = req.body;
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    res.status(404);
    throw new Error('Administrator not found');
  }

  // Check if email is taken by another admin
  if (email && email !== admin.email) {
    const emailExists = await Admin.findOne({ email });
    if (emailExists) {
      res.status(400);
      throw new Error('An administrator with this email already exists');
    }
    admin.email = email;
  }

  // Check username
  if (username && username !== admin.username) {
    const usernameExists = await Admin.findOne({ username });
    if (usernameExists) {
      res.status(400);
      throw new Error('This username is already taken');
    }
    admin.username = username;
  }

  // Handle password update if provided
  if (password && password.trim() !== '') {
    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters long');
    }
    admin.password = password;
  }

  // Prevent modifying one's own role or permissions to avoid lockouts
  if (req.admin._id.toString() !== admin._id.toString()) {
    if (role) admin.role = role;
    if (permissions) admin.permissions = permissions;
  } else {
    // If updating self, prevent changing role or removing 'admins' permission
    if (role && role !== admin.role) {
      res.status(400);
      throw new Error('You cannot change your own role to prevent system lockout');
    }
  }

  await admin.save();

  res.json({
    _id: admin._id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions
  });
});

// @desc    Delete an admin account
// @route   DELETE /api/admin/accounts/:id
// @access  Private (admins permission required)
const deleteAdmin = asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.params.id);

  if (!admin) {
    res.status(404);
    throw new Error('Administrator not found');
  }

  // Prevent deleting oneself
  if (req.admin._id.toString() === admin._id.toString()) {
    res.status(400);
    throw new Error('You cannot delete your own admin account');
  }

  // Prevent deleting the last superadmin
  if (admin.role === 'superadmin') {
    const superadminCount = await Admin.countDocuments({ role: 'superadmin' });
    if (superadminCount <= 1) {
      res.status(400);
      throw new Error('Cannot delete the last superadmin account in the system');
    }
  }

  await admin.deleteOne();
  res.json({ message: 'Administrator account deleted successfully' });
});

module.exports = {
  getAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin
};
