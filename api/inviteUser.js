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
  const { email, role } = req.body;
  if (!email || !role) {
    return res.status(400).json({ error: 'Email and role are required' });
  }
  try {
    // Invite user with role metadata via v1 signature
    const { data, error } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      { user_metadata: { role } }
    );
    if (error) return res.status(400).json({ error: error.message });
    return res.status(200).json({ data });
  } catch (err) {
    console.error('inviteUser error', err);
    return res.status(500).json({ error: err.message });
  }
}
