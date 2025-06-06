/* @refresh reset */
import { createContext, useContext, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { supabase } from '@/lib/supabaseClient';
import type { User as SupaUser, Session, AuthChangeEvent } from '@supabase/supabase-js';

// Context holding the authenticated user, role, restaurant name, full name, loading state, and auth methods
type AuthContextType = {
  user: SupaUser | null;
  role: string | null;
  restaurantName: string | null;
  fullName: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextType>({
  user: null,
  role: null,
  restaurantName: null,
  fullName: null,
  loading: true,
  login: async () => {},
  logout: async () => {},
});

// Props for the provider
interface AuthProviderProps {
  children: ReactNode;
}

// Helper to fetch user's role, restaurant name, and full name from profiles table
const fetchProfileData = async (
  userId: string
): Promise<{ role: string | null; restaurantName: string | null; fullName: string | null }> => {
  // Selecting all columns to ensure full_name is included
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error || !profile) {
    console.error('[fetchProfileData] error or no profile:', error, profile);
    return { role: null, restaurantName: null, fullName: null };
  }
  // Debug retrieved values
  console.log('[fetchProfileData] profile:', profile);
  return {
    role: profile.role ?? null,
    restaurantName: profile.restaurant_name ?? null,
    fullName: (profile as any).full_name ?? null,
  };
};

// AuthProvider wraps the app and provides user state
export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<SupaUser | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [restaurantName, setRestaurantName] = useState<string | null>(null);
  const [fullName, setFullName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Handles session & profile resolution
    const handleSession = async (session: Session | null) => {
      setLoading(true);
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        try {
          const { role: fetchedRole, restaurantName: fetchedRest, fullName: fetchedFull } = await fetchProfileData(currentUser.id);
          if (!mounted) return;
          setRole(fetchedRole);
          setRestaurantName(fetchedRest);
          setFullName(fetchedFull);
        } catch {
          if (!mounted) return;
          setRole(null);
          setRestaurantName(null);
          setFullName(null);
        }
      } else {
        setRole(null);
        setRestaurantName(null);
        setFullName(null);
      }
      if (mounted) setLoading(false);
    };

    // Initial session fetch
    supabase.auth.getSession()
      .then(({ data: { session } }) => {
        if (!mounted) return;
        void handleSession(session);
      })
      .catch(() => {
        if (!mounted) return;
        void handleSession(null);
      });

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (!mounted) return;
        void handleSession(session);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

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
    setRestaurantName(null);
    setFullName(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, restaurantName, fullName, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to access auth context
export function useAuth(): AuthContextType {
  return useContext(AuthContext);
}
