import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { full_name, email, role, phone, is_active, restaurant_id, branch_id } = req.body;
  if (!full_name || !email || !role || phone == null || is_active == null) {
    return res.status(400).json({ error: 'full_name, email, role, phone, is_active are required' });
  }
  try {
    // Invite user with all metadata
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        user_metadata: { full_name, role, phone, is_active },
        data: { password: null } // use invite link
      }
    );
    if (error) return res.status(400).json({ error: error.message });
    const userId = data.user.id;
    if (role !== 'Super Admin') {
      await supabaseAdmin.from('branch_users').insert({ branch_id, user_id: userId });
    }
    return res.status(200).json({ data });
  } catch (err) {
    console.error('inviteUser error', err);
    return res.status(500).json({ error: err.message });
  }
}
