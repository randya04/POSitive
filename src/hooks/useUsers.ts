import { useState, useCallback, useEffect } from 'react';
import { toast } from '@/components/ui/toast';
import type { User } from '@/types/user';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/users`);
      let result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error fetching users');
      let normalized = result;
      if (Array.isArray(result)) {
        normalized = result.map((u: any) => ({
          id: u.id,
          full_name: u.full_name,
          email: u.email,
          phone: u.phone ?? '',
          role: u.role,
          restaurant: u.restaurant ?? null,
          restaurant_id: u.restaurant_id ?? null,
          branch: u.branch ?? null,
          branch_id: u.branch_id ?? null,
          is_active: u.is_active,
        }));
      }
      setUsers(normalized.data || normalized);
    } catch (unknownError) {
      const errorMessage = unknownError instanceof Error ? unknownError.message : String(unknownError);
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleToggleActive = useCallback(async (id: string, isActive: boolean) => {
    try {
      const response = await fetch(`${API_URL}/api/users`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_active: isActive }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error actualizando estado');
      toast.success(`Usuario ${isActive ? 'activado' : 'desactivado'}`);
      setUsers(prev => prev.map(u =>
        u.id === id
          ? {
              ...u,
              is_active: isActive,
              restaurant_id: u.restaurant_id ?? null,
              branch: u.branch ?? null,
              branch_id: u.branch_id ?? null,
              restaurant: u.restaurant ?? null,
              phone: u.phone ?? '',
            }
          : u
      ));
    } catch (unknownError) {
      const errorMessage = unknownError instanceof Error ? unknownError.message : String(unknownError);
      setError(errorMessage);
      toast.error(errorMessage);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, fetchUsers, handleToggleActive };
}