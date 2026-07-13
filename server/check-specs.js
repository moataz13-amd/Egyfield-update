require('dotenv').config();
const dns = require('dns').promises;
const { Client } = require('pg');

(async () => {
  const hostname = 'db.tvojrlejpgiqownwjppr.supabase.co';
  
  // Try to resolve the hostname
  try {
    const addrs = await dns.resolve4(hostname);
    console.log('IPv4 addresses:', addrs);
  } catch (e) {
    console.log('IPv4 DNS failed:', e.message);
  }

  try {
    const addrs = await dns.resolve6(hostname);
    console.log('IPv6 addresses:', addrs);
  } catch (e) {
    console.log('IPv6 DNS failed:', e.message);
  }

  // Try connecting with Supabase JS client to do a raw query
  // First check if the column exists via a Supabase stored procedure
  // Actually, let's try via the Supabase REST API directly
  const axios = require('axios');
  
  try {
    const response = await axios.post(
      `${process.env.SUPABASE_URL}/rest/v1/rpc/`,
      { query: "SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_schema = 'public'" },
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.SUPABASE_SERVICE_ROLE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        },
        timeout: 10000,
      }
    );
    console.log('RPC response:', response.data);
  } catch (err) {
    console.log('RPC failed:', err.message);
  }

  // Alternative: use Supabase JS client with raw query through a function
  // Let's try querying a simple function
  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

  // Check what version
  const { data: ver } = await supabase.rpc('version');
  console.log('Supabase version:', ver);

  // Try to query products table
  const { data, error } = await supabase.from('products').select('id, name').limit(1);
  if (error) {
    console.log('Products query error:', error.message);
    // Try selecting with specifications
    const { data: d2, error: e2 } = await supabase.from('products').select('id, name, specifications').limit(1);
    if (e2) {
      console.log('specifications error:', e2.message);
      if (e2.message.includes('schema cache')) {
        console.log('Try reloading schema cache via pg or dashboard');
      }
    } else {
      console.log('specifications works!', d2);
    }
  } else {
    console.log('Products query works:', data);
  }
})();
