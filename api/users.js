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
    // Fetch profiles with extra fields
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, role, phone, is_active, restaurant_id');
    if (profilesError) throw profilesError;

    // Fetch restaurant names
    const restaurantIds = [...new Set(profiles.map(p => p.restaurant_id))].filter(Boolean);
    let restaurantMap = {};
    if (restaurantIds.length) {
      const { data: restaurants, error: restaurantsError } = await supabaseAdmin
        .from('restaurants')
        .select('id, name')
        .in('id', restaurantIds);
      if (restaurantsError) throw restaurantsError;
      restaurantMap = restaurants.reduce((acc, r) => ({ ...acc, [r.id]: r.name }), {});
    }

    // Construct response
    const users = profiles.map(p => ({
      id: p.id,
      full_name: p.full_name,
      email: p.email,
      role: p.role,
      phone: p.phone,
      is_active: p.is_active,
      restaurant: restaurantMap[p.restaurant_id] || null,
    }));
    return res.status(200).json({ data: users });
  } catch (err) {
    console.error('getUsers error:', err);
    return res.status(500).json({ error: err.message });
  }
}
