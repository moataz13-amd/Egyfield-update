const { supabase } = require('./config/db');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    if (!supabase) {
      console.error('Supabase not configured — check SUPABASE_URL & SUPABASE_SERVICE_ROLE_KEY in server/.env');
      process.exit(1);
    }

    // Check if admin exists
    const { data: existing } = await supabase.from('admins').select('id').limit(1);
    if (existing && existing.length > 0) {
      console.log('Admin already exists. Login with admin@egyfield.com / EgyField@2024');
      process.exit(0);
    }

    // Create admin
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('EgyField@2024', salt);
    const { error } = await supabase.from('admins').insert([{
      username: 'admin',
      email: 'admin@egyfield.com',
      password: hashedPassword,
      role: 'superadmin',
      permissions: ['products', 'articles', 'inquiries', 'settings', 'admins'],
    }]).select().single();

    if (error) throw error;
    console.log('Admin created: admin@egyfield.com / EgyField@2024');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
})();
