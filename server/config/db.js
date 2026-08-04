const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

dotenv.config();

let supabase;
if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
  supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
    db: { schema: 'public' },
  });
}

let connected = false;

const connectDB = async () => {
  if (connected || !supabase) return;
  try {
    const { error } = await supabase.from('admins').select('id', { count: 'exact', head: true });
    if (error && !error.message?.includes('relation') && !error.message?.includes('does not exist')) {
      throw error;
    }
    const { count } = await supabase.from('admins').select('*', { count: 'exact', head: true });
    if (!count || count === 0) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Delta Harvest@2024', salt);
      const { error: insErr } = await supabase.from('admins').insert([{
        username: 'admin',
        email: 'admin@deltaharvest.com',
        password: hashedPassword,
        role: 'superadmin',
        permissions: ['products', 'articles', 'inquiries', 'settings', 'admins'],
      }]);
      if (insErr) {
        console.error('Admin seed failed:', insErr.message);
        throw insErr;
      }
      console.log('Default superadmin seeded: admin@deltaharvest.com / Delta Harvest@2024');
    }
    connected = true;
  } catch (error) {
    console.error('Database error:', error.message);
    if (!process.env.VERCEL) process.exit(1);
    throw error;
  }
};

module.exports = { supabase, connectDB };
