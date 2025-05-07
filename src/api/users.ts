// src/api/users.ts - Supabase client-side API for user management
import { createClient } from '@supabase/supabase-js'
import type { User, Restaurant, Branch } from '../types/user'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getUsers(): Promise<User[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, email, role, phone, is_active, restaurant_id, branch_id')
  if (error) throw error

  // Fetch restaurant names
  const restaurantIds = [...new Set(data.map((p: any) => p.restaurant_id))].filter(Boolean)
  let restaurantMap: Record<string, string> = {}
  if (restaurantIds.length) {
    const { data: restaurants, error: restaurantsError } = await supabase
      .from('restaurants')
      .select('id, name')
      .in('id', restaurantIds)
    if (restaurantsError) throw restaurantsError
    restaurantMap = (restaurants || []).reduce((acc: any, r: any) => ({ ...acc, [r.id]: r.name }), {})
  }

  // Fetch branch names
  const branchIds = [...new Set(data.map((p: any) => p.branch_id))].filter(Boolean)
  let branchMap: Record<string, string> = {}
  if (branchIds.length) {
    const { data: branches, error: branchesError } = await supabase
      .from('branches')
      .select('id, name')
      .in('id', branchIds)
    if (branchesError) throw branchesError
    branchMap = (branches || []).reduce((acc: any, b: any) => ({ ...acc, [b.id]: b.name }), {})
  }

  return data.map((p: any) => ({
    id: p.id,
    full_name: p.full_name,
    email: p.email,
    role: p.role,
    phone: p.phone,
    is_active: p.is_active,
    restaurant: restaurantMap[p.restaurant_id] || null,
    branch: branchMap[p.branch_id] || null,
    restaurant_id: p.restaurant_id || null,
    branch_id: p.branch_id || null,
  }))
}

export async function toggleUserActive(id: string, value: boolean) {
  const { error } = await supabase
    .from('profiles')
    .update({ is_active: value })
    .eq('id', id)
  if (error) throw error
}

export async function createUser(user: Partial<User>) {
  const { error } = await supabase
    .from('profiles')
    .insert([user])
  if (error) throw error
}

export async function updateUser(id: string, user: Partial<User>) {
  const { error } = await supabase
    .from('profiles')
    .update(user)
    .eq('id', id)
  if (error) throw error
}

export async function deleteUser(id: string) {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', id)
  if (error) throw error
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const { data, error } = await supabase
    .from('restaurants')
    .select('id, name')
  if (error) throw error
  return data || []
}

export async function getBranches(restaurantId: string): Promise<Branch[]> {
  const { data, error } = await supabase
    .from('branches')
    .select('id, name')
    .eq('restaurant_id', restaurantId)
  if (error) throw error
  return data || []
}
