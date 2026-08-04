const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const SUPABASE_URL = process.env.SUPABASE_URL;
    const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!SUPABASE_URL || !SUPABASE_KEY) {
      return res.status(500).json({
        error: 'Supabase not configured',
        hasUrl: !!SUPABASE_URL,
        hasKey: !!SUPABASE_KEY,
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false },
    });

    const email = req.body?.email || 'admin@deltaharvest.com';
    const password = req.body?.password || 'DeltaHarvest@2024';
    const username = req.body?.username || 'admin';

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if admin exists
    const { data: existing, error: findErr } = await supabase
      .from('admins')
      .select('id')
      .eq('email', email)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      return res.status(500).json({ error: 'Query failed', detail: findErr.message });
    }

    let result;

    if (existing) {
      const { data, error } = await supabase
        .from('admins')
        .update({
          password: hashedPassword,
          username,
          role: 'superadmin',
          permissions: ['products', 'articles', 'inquiries', 'settings', 'admins'],
        })
        .eq('id', existing.id)
        .select('id, email, username, role')
        .single();
      if (error) return res.status(500).json({ error: 'Update failed', detail: error.message });
      result = { action: 'updated', admin: data };
    } else {
      const { data, error } = await supabase
        .from('admins')
        .insert([{
          email,
          username,
          password: hashedPassword,
          role: 'superadmin',
          permissions: ['products', 'articles', 'inquiries', 'settings', 'admins'],
        }])
        .select('id, email, username, role')
        .single();
      if (error) return res.status(500).json({ error: 'Insert failed', detail: error.message });
      result = { action: 'created', admin: data };
    }

    // Also generate a token right away
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ id: result.admin.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    return res.status(200).json({
      ...result,
      message: `Admin ${result.action}. Login: ${email} / ${password}`,
      token,
      supabaseUrl: SUPABASE_URL.substring(0, 30) + '...',
    });
  } catch (err) {
    return res.status(500).json({ error: err.message, stack: err.stack });
  }
};
