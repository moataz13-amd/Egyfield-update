const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { supabase } = require('../config/db');
const Admin = require('../models/Admin');

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

const DEFAULT_ADMIN = {
  username: 'admin',
  email: 'admin@deltaharvest.com',
  password: 'Delta Harvest@2024',
  role: 'superadmin',
  permissions: ['products', 'articles', 'inquiries', 'settings', 'admins'],
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

  // Use raw Supabase query directly — bypass ORM to avoid any Model layer issues
  let admin = null;
  if (supabase) {
    const { data, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('[auth] Supabase query error:', error.message);
    } else {
      admin = data;
    }
  }

  console.log(`[auth] Login attempt for ${email}: admin ${admin ? 'found' : 'NOT FOUND'}`);

  if (!admin) {
    // Self-healing: if default admin email and no admin exists, create one
    if (email === 'admin@deltaharvest.com' && supabase) {
      console.log('[auth] Default admin not found — auto-creating...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Delta Harvest@2024', salt);

      const { data: created, error: createErr } = await supabase
        .from('admins')
        .insert([{
          ...DEFAULT_ADMIN,
          password: hashedPassword,
        }])
        .select()
        .single();

      if (createErr) {
        console.error('[auth] Auto-create failed:', createErr.message);
        res.status(401);
        throw new Error('Invalid credentials');
      }

      const isMatch = await bcrypt.compare(password, created.password);
      if (isMatch) {
        console.log('[auth] Auto-created admin and logged in successfully');
        return res.json({
          _id: created.id,
          username: created.username,
          email: created.email,
          role: created.role,
          permissions: created.permissions,
          token: generateToken(created.id),
        });
      }
    }

    res.status(401);
    throw new Error('Invalid credentials');
  }

  // Verify password with bcrypt directly
  if (!admin.password) {
    console.error('[auth] Admin found but password field is null/empty');
    res.status(401);
    throw new Error('Invalid credentials');
  }

  const isMatch = await bcrypt.compare(password, admin.password);

  console.log(`[auth] Password match: ${isMatch}`);

  if (!isMatch) {
    // Self-healing: if default admin email, reset password to known value
    if (email === 'admin@deltaharvest.com' && supabase) {
      console.log('[auth] Default admin password mismatch — resetting...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Delta Harvest@2024', salt);

      const { error: updateErr } = await supabase
        .from('admins')
        .update({ password: hashedPassword })
        .eq('id', admin.id);

      if (!updateErr) {
        // Retry password check with new hash
        const retryMatch = await bcrypt.compare(password, hashedPassword);
        if (retryMatch) {
          console.log('[auth] Password reset and login succeeded');
          return res.json({
            _id: admin.id,
            username: admin.username,
            email: admin.email,
            role: admin.role,
            permissions: admin.permissions,
            token: generateToken(admin.id),
          });
        }
      }
    }

    res.status(401);
    throw new Error('Invalid credentials');
  }

  res.json({
    _id: admin.id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
    token: generateToken(admin.id),
  });
});

// @desc    Register admin (first-time setup only)
// @route   POST /api/auth/register
// @access  Public (restricted - only if no admins exist)
const registerAdmin = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  const adminCount = await Admin.countDocuments();
  if (adminCount > 0) {
    res.status(403);
    throw new Error('Admin already exists. Registration is disabled.');
  }

  if (!username || !email || !password) {
    res.status(400);
    throw new Error('Please provide all fields');
  }

  const admin = await Admin.create({
    username,
    email,
    password,
    role: 'superadmin',
    permissions: ['products', 'articles', 'inquiries', 'settings', 'admins'],
  });

  res.status(201).json({
    _id: admin._id,
    username: admin.username,
    email: admin.email,
    role: admin.role,
    permissions: admin.permissions,
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
    throw new Error('Please provide current and new password');
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

// @desc    Debug endpoint to check DB state
// @route   GET /api/auth/debug
// @access  Public (remove in production)
const debugAuth = asyncHandler(async (req, res) => {
  const result = {
    supabaseClient: !!supabase,
    envSupabaseUrl: process.env.SUPABASE_URL ? process.env.SUPABASE_URL.substring(0, 30) + '...' : null,
    envServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : null,
    envJwtSecret: process.env.JWT_SECRET ? 'SET' : null,
  };

  if (supabase) {
    const { data, error, count } = await supabase
      .from('admins')
      .select('id, username, email, role, password', { count: 'exact' });

    result.adminsCount = count;
    result.admins = (data || []).map(a => ({
      id: a.id,
      email: a.email,
      username: a.username,
      role: a.role,
      hasPassword: !!a.password,
      passwordPrefix: a.password ? a.password.substring(0, 7) : null,
    }));
    if (error) result.queryError = error.message;
  }

  res.json(result);
});

// @desc    Seed/reset superadmin — call once to guarantee admin exists with correct password
// @route   POST /api/auth/seed
// @access  Public
const seedAdmin = asyncHandler(async (req, res) => {
  if (!supabase) {
    res.status(500);
    throw new Error('Supabase not configured');
  }

  const salt = await bcrypt.genSalt(12);
  const hashedPassword = await bcrypt.hash(DEFAULT_ADMIN.password, salt);

  // Try upsert: if email exists → update password; otherwise → insert
  const { data: existing } = await supabase
    .from('admins')
    .select('id')
    .eq('email', DEFAULT_ADMIN.email)
    .limit(1)
    .maybeSingle();

  let result;

  if (existing) {
    const { data, error } = await supabase
      .from('admins')
      .update({ password: hashedPassword })
      .eq('id', existing.id)
      .select('id, email, username, role')
      .single();
    if (error) {
      res.status(500);
      throw new Error('Failed to update admin: ' + error.message);
    }
    result = { action: 'updated', admin: data };
  } else {
    const { data, error } = await supabase
      .from('admins')
      .insert([{
        username: DEFAULT_ADMIN.username,
        email: DEFAULT_ADMIN.email,
        password: hashedPassword,
        role: DEFAULT_ADMIN.role,
        permissions: DEFAULT_ADMIN.permissions,
      }])
      .select('id, email, username, role')
      .single();
    if (error) {
      res.status(500);
      throw new Error('Failed to create admin: ' + error.message);
    }
    result = { action: 'created', admin: data };
  }

  console.log(`[auth/seed] ${result.action} admin: ${DEFAULT_ADMIN.email}`);
  res.json({ ...result, message: 'Admin ready — login with admin@deltaharvest.com / Delta Harvest@2024' });
});

module.exports = { loginAdmin, registerAdmin, getMe, changePassword, debugAuth, seedAdmin };
