/* @refresh reset */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupaUser, AuthChangeEvent } from '@supabase/supabase-js';

// Context holding the authenticated user, role, loading state, and auth methods
type AuthContextType = {
  user: SupaUser | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Helper to fetch user's role from profiles table
const fetchProfileRole = async (userId: string): Promise<string | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .single();
  return error || !profile ? null : profile.role;
};

// AuthProvider wraps the app and provides user state
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Initial session check
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        setLoading(false);
      })
      .catch(err => {
        setLoading(false);
      });
    // Subscribe to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      setUser(session?.user ?? null);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (user) {
      fetchProfileRole(user.id)
        .then(roleValue => setRole(roleValue))
        .catch(err => {});
    } else {
      setRole(null);
    }
  }, [user]);

  // Auth methods
  const login = async (email: string, password: string): Promise<void> => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) throw error;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
