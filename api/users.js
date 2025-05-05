import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role');
    if (error) throw error;
    return res.status(200).json({ data });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: err.message });
  }
}
