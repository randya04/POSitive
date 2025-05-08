import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
    const { restaurant_id } = req.query;
    if (!restaurant_id) {
      return res.status(400).json({ error: 'restaurant_id is required' });
    }
    try {
      const { data, error } = await supabaseAdmin
        .from('branches')
        .select('id, name')
        .eq('restaurant_id', restaurant_id)
        .order('name');
      if (error) throw error;
      return res.status(200).json(data);
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}
