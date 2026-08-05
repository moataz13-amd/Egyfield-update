const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  try {
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;
    
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      // Small query to keep the database awake
      await supabase.from('settings').select('id').limit(1);
    }
    
    res.status(200).json({ pong: true, dbAwake: true, timestamp: new Date().toISOString() });
  } catch (err) {
    res.status(500).json({ pong: false, error: err.message });
  }
};
