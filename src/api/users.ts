// src/api/users.ts - Supabase client-side API for user management
import type { User, Restaurant, Branch } from '../types/user'

export async function getUsers(): Promise<User[]> {
  const res = await fetch('/api/users');
  if (!res.ok) throw new Error('Error fetching users');
  const json = await res.json();
  return json.data;
}

export async function toggleUserActive(id: string, value: boolean) {
  const res = await fetch('/api/users', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, is_active: value })
  });
  if (!res.ok) throw new Error('Error updating user active status');
}

export async function createUser(user: Partial<User>) {
  const res = await fetch('/api/users', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(user)
  });
  if (!res.ok) throw new Error('Error creating user');
}

export async function deleteUser(id: string) {
  const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error('Error deleting user');
}

export async function getRestaurants(): Promise<Restaurant[]> {
  const res = await fetch('/api/restaurants');
  if (!res.ok) throw new Error('Error fetching restaurants');
  return await res.json();
}

export async function getBranches(restaurantId: string): Promise<Branch[]> {
  const res = await fetch(`/api/branches?restaurant_id=${restaurantId}`);
  if (!res.ok) throw new Error('Error fetching branches');
  return await res.json();
}

