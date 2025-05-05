import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  console.log('inviteUser called with body:', req.body);
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  const { full_name, email, role, phone, is_active, restaurant_id, branch_id } = req.body;
  if (!full_name || !email || !role || phone == null || is_active == null) {
    return res.status(400).json({ error: 'full_name, email, role, phone, is_active are required' });
  }
  // Check existing profile by email
  const { data: existingProfiles, error: existingError } = await supabaseAdmin
    .from('profiles')
    .select('id')
    .eq('email', email)
    .limit(1);
  if (existingError) throw existingError;
  // Block duplicate email invites for new users
  if (existingProfiles.length) {
    return res.status(409).json({ error: 'Ya existe un usuario con este correo electrónico' });
  }
  try {
    // Invite user by email, passing user metadata
    const { data, error: inviteError } = await supabaseAdmin.auth.admin.inviteUserByEmail(
      email,
      {
        data: { full_name, role, phone, is_active },
        // Optionally: redirectTo: process.env.VITE_API_URL + '/auth/callback'
      }
    );
    console.log('inviteUserByEmail response:', { data, inviteError });
    if (inviteError) {
      console.error('inviteUser backend error:', inviteError);
      return res.status(400).json({ error: inviteError.message, details: inviteError });
    }
    // Fetch user to get ID since inviteUserByEmail returns null user
    const { data: listData, error: listError } = await supabaseAdmin.auth.admin.listUsers({ query: email });
    console.log('listUsers response:', { listData, listError });
    if (listError || !listData.users.length) {
      console.error('listUsers error or no users:', listError);
      return res.status(500).json({ error: 'Could not fetch invited user ID', details: listError });
    }
    const userId = listData.users[0].id;
    // Upsert profile; skip restaurant_id for super_admin
    const profilePayload = { id: userId, full_name, email, role, phone, is_active };
    if (role !== 'super_admin') profilePayload.restaurant_id = restaurant_id;
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert(profilePayload, { onConflict: 'id' });
    console.log('profile upsert response:', { profileData, profileError });
    if (profileError) {
      console.error('profile upsert error:', profileError);
      // If email already exists in profiles
      if (profileError.code === '23505') {
        return res.status(409).json({ error: 'Ya existe un usuario con este correo electrónico' });
      }
      return res.status(500).json({ error: profileError.message, details: profileError });
    }
    // Skip branch assignment for super_admin role
    if (role !== 'super_admin') {
      const { data: branchData, error: branchError } = await supabaseAdmin
        .from('branch_users')
        .insert({ branch_id, user_id: userId });
      console.log('branch_users insert response:', { branchData, branchError });
      if (branchError) {
        console.error('branch_users insert error:', branchError);
        return res.status(500).json({ error: branchError.message, details: branchError });
      }
    }
    return res.status(200).json({ data });
  } catch (err) {
    console.error('inviteUser exception:', err);
    console.error('inviteUser error', err);
    return res.status(500).json({ error: err.message });
  }
}
