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
    // Fetch the current session on mount
    supabase.auth.getSession()
      .then(async ({ data }) => {
        const u = data.session?.user ?? null;
        setUser(u);
        let roleValue: string | null = null;
        if (u) {
          try {
            roleValue = await fetchProfileRole(u.id);
          } catch (err) {
            console.error("fetchProfileRole error (init)", err);
          }
        }
        setRole(roleValue);
      })
      .catch((err) => {
        console.error("useAuth.getSession error", err);
      })
      .finally(() => {
        setLoading(false);
      });

    // Listen for auth changes (login, logout)
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session) => {
        try {
          const u = session?.user ?? null;
          setUser(u);
          let roleValue: string | null = null;
          if (u) {
            try {
              roleValue = await fetchProfileRole(u.id);
            } catch (err) {
              console.error("fetchProfileRole error (listener)", err);
            }
          }
          setRole(roleValue);
        } catch (err) {
          console.error("onAuthStateChange handler error", err);
        }
      }
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  // Auth methods
  const login = async (email: string, password: string): Promise<void> => {
    console.log("useAuth.login: start manual login", { email });
    // Manual login via Supabase Auth REST API
    const url = `${import.meta.env.VITE_SUPABASE_URL}/auth/v1/token?grant_type=password`;
    console.log("useAuth.login: fetch URL", url);
    console.log("useAuth.login: before fetch");
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    console.log("useAuth.login: after fetch");
    console.log("useAuth.login: fetch completed with status", res.status);
    console.log("useAuth.login: before response JSON");
    const json = await res.json();
    console.log("useAuth.login: after response JSON");
    console.log("useAuth.login: response JSON", json);
    if (!res.ok) {
      const msg = json.error_description || json.error || 'Email y/o contraseña no son válidos';
      throw new Error(msg);
    }
    // Fire-and-forget: set session in Supabase client
    supabase.auth.setSession({
      access_token: json.access_token,
      refresh_token: json.refresh_token,
    })
      .then(({ data: { session }, error }) =>
        console.log('useAuth.login async setSession', { session, error })
      )
      .catch(err =>
        console.error('useAuth.login async setSession error', err)
      );
    // Update local state immediately from JSON user
    const user = json.user;
    console.log('useAuth.login: setting user', user);
    setUser(user);
    console.log('useAuth.login: before async fetchProfileRole', user.id);
    // Fetch role in background
    fetchProfileRole(user.id)
      .then(roleValue => {
        console.log('useAuth.login: async fetchProfileRole result', roleValue);
        setRole(roleValue);
      })
      .catch(err => console.error('useAuth.login: async fetchProfileRole error', err));
    console.log('useAuth.login: done');
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
