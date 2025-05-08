import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

export default async function handler(req, res) {
  if (req.method === 'GET') {
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

      // Construct GET response
      const users = profiles.map(p => ({
        id: p.id,
        full_name: p.full_name,
        email: p.email,
        role: p.role,
        phone: p.phone,
        is_active: p.is_active,
        restaurant: restaurantMap[p.restaurant_id] || null,
        restaurant_id: p.restaurant_id || null,
      }));
      return res.status(200).json({ data: users });
    } catch (err) {
      console.error('getUsers error:', err);
      return res.status(500).json({ error: err.message });
    }
  } else if (req.method === 'PATCH') {
    const { id, full_name, email, phone, role, is_active, restaurant_id, branch_id } = req.body;
    if (!id) {
      return res.status(400).json({ error: 'id is required' });
    }
    try {
      // Construir objeto de actualización solo con campos presentes
      const updateFields = {};
      if (typeof full_name !== 'undefined') updateFields.full_name = full_name;
      if (typeof email !== 'undefined') updateFields.email = email;
      if (typeof phone !== 'undefined') updateFields.phone = phone;
      if (typeof role !== 'undefined') updateFields.role = role;
      if (typeof is_active !== 'undefined') updateFields.is_active = is_active;
      if (typeof restaurant_id !== 'undefined') updateFields.restaurant_id = restaurant_id;
      if (typeof branch_id !== 'undefined') updateFields.branch_id = branch_id;

      const { error: updateError, data: updatedData } = await supabaseAdmin
        .from('profiles')
        .update(updateFields)
        .eq('id', id)
        .select()
        .single();
      if (updateError) throw updateError;
      return res.status(200).json({ data: updatedData });
    } catch (err) {
      console.error('update user error:', err);
      return res.status(500).json({ error: err.message });
    }
  } else {
    return res.status(405).json({ error: 'Method not allowed' });
  }
}