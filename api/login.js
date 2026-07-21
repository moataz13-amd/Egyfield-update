const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
    const JWT_SECRET = process.env.JWT_SECRET;

    if (!SUPABASE_URL || !SUPABASE_KEY || !JWT_SECRET) {
      return res.status(500).json({
        message: 'Server misconfigured',
        detail: `URL:${!!SUPABASE_URL} KEY:${!!SUPABASE_KEY} JWT:${!!JWT_SECRET}`,
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });

    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide email and password' });
    }

    const { data: admin, error } = await supabase
      .from('admins')
      .select('*')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ message: 'Database error', detail: error.message });
    }

    if (!admin || !admin.password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: admin.id }, JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      _id: admin.id,
      username: admin.username,
      email: admin.email,
      role: admin.role,
      permissions: admin.permissions,
      token,
    });
  } catch (err) {
    return res.status(500).json({ message: 'Server error', detail: err.message });
  }
};
