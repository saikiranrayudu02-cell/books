'use client';
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User } from '@/types';
import { createClient } from '@/utils/supabase/client';
import type { Session, AuthChangeEvent } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (userData: User) => void;
  loginWithEmail: (email: string, password: string) => Promise<{ error?: string }>;
  registerWithEmail: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const supabase = createClient();

/**
 * Sync Supabase auth user to the app's `users` table.
 * This ensures Google OAuth users get a row in `users` for orders, wishlist, etc.
 */
async function syncUserToDatabase(supabaseUser: { id: string; email?: string; user_metadata?: Record<string, unknown> }): Promise<User | null> {
  try {
    const name = (supabaseUser.user_metadata?.full_name as string) 
      || (supabaseUser.user_metadata?.name as string) 
      || supabaseUser.email?.split('@')[0] 
      || 'User';
    const email = supabaseUser.email || '';

    // Check if user exists in our app's users table
    const res = await fetch('/api/auth/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: supabaseUser.id,
        name,
        email,
        image: (supabaseUser.user_metadata?.avatar_url as string) || null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.user;
    }

    // Fallback: return a basic user object
    return {
      id: supabaseUser.id,
      name,
      email,
      role: 'customer',
    };
  } catch (err) {
    console.error('Failed to sync user to database:', err);
    return {
      id: supabaseUser.id,
      name: supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || '',
      role: 'customer',
    };
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from Supabase session
  useEffect(() => {
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const appUser = await syncUserToDatabase(session.user);
          setUser(appUser);
        } else {
          // Fallback: check localStorage for users who logged in via the old email/password API
          const storedUser = localStorage.getItem('tenali_user');
          if (storedUser) {
            try {
              setUser(JSON.parse(storedUser));
            } catch {
              localStorage.removeItem('tenali_user');
            }
          }
        }
      } catch (e) {
        console.error('Failed to initialize auth:', e);
        // Fallback to localStorage
        const storedUser = localStorage.getItem('tenali_user');
        if (storedUser) {
          try {
            setUser(JSON.parse(storedUser));
          } catch {
            localStorage.removeItem('tenali_user');
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const appUser = await syncUserToDatabase(session.user);
          setUser(appUser);
          // Also store in localStorage for backward compatibility
          if (appUser) {
            localStorage.setItem('tenali_user', JSON.stringify(appUser));
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('tenali_user');
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Legacy login (for existing email/password API route)
  const login = useCallback((userData: User) => {
    setUser(userData);
    localStorage.setItem('tenali_user', JSON.stringify(userData));
  }, []);

  // Email/password login via Supabase Auth
  const loginWithEmail = useCallback(async (email: string, password: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      // Fallback to legacy API for users not yet in Supabase Auth
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          return { error: data.error || 'Login failed' };
        }
        login(data.user);
        return {};
      } catch {
        return { error: error.message };
      }
    }
    return {};
  }, [login]);

  // Email/password registration via Supabase Auth
  const registerWithEmail = useCallback(async (email: string, password: string, name?: string): Promise<{ error?: string }> => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name || email.split('@')[0],
        },
      },
    });
    if (error) {
      return { error: error.message };
    }
    return {};
  }, []);

  // Google OAuth login
  const loginWithGoogle = useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      console.error('Google login error:', error);
    }
  }, []);

  // Logout
  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    localStorage.removeItem('tenali_user');
  }, []);

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      isAuthenticated,
      login,
      loginWithEmail,
      registerWithEmail,
      loginWithGoogle,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
