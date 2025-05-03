import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { Session, User as SupaUser, AuthChangeEvent } from '@supabase/supabase-js';

// Context holding the authenticated user (or null)
type AuthContextType = { user: SupaUser | null };
const AuthContext = createContext<AuthContextType>({ user: null });

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// AuthProvider wraps the app and provides user state
export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<SupaUser | null>(null);

  useEffect(() => {
    // Fetch the current session on mount
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
    });

    // Listen for auth changes (login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event: AuthChangeEvent, session) => {
        setUser(session?.user ?? null);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => useContext(AuthContext);
