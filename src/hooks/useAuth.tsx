import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupaUser, AuthChangeEvent, AuthError } from '@supabase/supabase-js';

// Context holding the authenticated user, role, loading state, and auth methods
type AuthContextType = {
  user: SupaUser | null;
  role: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ data: any; error: AuthError | null }>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  loading: true,
  login: async () => ({ data: null, error: null }),
  logout: async () => {},
});

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider wraps the app and provides user state
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch the current session on mount
    supabase.auth.getSession().then(({ data }) => {
      const u = data.session?.user ?? null;
      setUser(u);
      setRole(u?.user_metadata.role ?? u?.app_metadata.role ?? null);
      setLoading(false);
    });

    // Listen for auth changes (login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session) => {
        const u = session?.user ?? null;
        setUser(u);
        setRole(u?.user_metadata.role ?? u?.app_metadata.role ?? null);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Auth methods
  const login = async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });
    const u = response.data.session?.user ?? null;
    setUser(u);
    setRole(u?.user_metadata.role ?? u?.app_metadata.role ?? null);
    return response;
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
export const useAuth = () => useContext(AuthContext);
