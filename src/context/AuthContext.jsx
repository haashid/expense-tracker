import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { mockService } from '../lib/mockService';

const AuthContext = createContext({});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(!isSupabaseConfigured);

  useEffect(() => {
    let mounted = true;

    // Safety net: Force loading to stop after 3 seconds no matter what
    const safetyTimeout = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization took too long, forcing load complete.');
        setLoading(false);
      }
    }, 3000);

    async function initializeAuth() {
      try {
        if (isSupabaseConfigured) {
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          
          if (mounted) {
            setUser(data.session?.user ?? null);
            if (data.session?.user) {
              await fetchProfile(data.session.user.id);
            } else {
              setLoading(false);
            }
          }
        } else {
          // Mock mode initialization
          const { data } = await mockService.auth.getSession();
          if (mounted) {
            if (data.session) {
              setUser(data.session.user);
              setProfile(data.session.profile);
            }
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err.message);
        // Force loading to false so the user isn't stuck forever
        if (mounted) setLoading(false);
      }
    }

    initializeAuth();

    let subscription;
    if (isSupabaseConfigured) {
      try {
        const { data } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            if (!mounted) return;
            try {
              setUser(session?.user ?? null);
              if (session?.user) {
                await fetchProfile(session.user.id);
              } else {
                setProfile(null);
                setLoading(false);
              }
            } catch (err) {
              console.error('Auth state change error:', err.message);
              setLoading(false);
            }
          }
        );
        subscription = data?.subscription;
      } catch (err) {
        console.error('Auth state subscription error:', err.message);
        if (mounted) setLoading(false);
      }
    }

    return () => {
      mounted = false;
      clearTimeout(safetyTimeout);
      if (subscription) subscription.unsubscribe();
    };
  }, []);

  async function fetchProfile(userId) {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) {
          // If RLS denies it or no profile exists, just log it.
          console.warn('Profile fetch warning (might be new user):', error.message);
          // If no profile exists, we can still fall back to creating a basic dummy profile 
          // so the app doesn't crash on role checks.
          setProfile({ id: userId, full_name: 'New User', role: 'member' });
        } else {
          setProfile(data);
        }
      }
    } catch (err) {
      console.error('Critical error fetching profile:', err.message);
      setProfile({ id: userId, full_name: 'Error Loading', role: 'member' });
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = profile?.role === 'admin';

  async function signIn(email, password) {
    if (isSupabaseConfigured) {
      return supabase.auth.signInWithPassword({ email, password });
    } else {
      const { data, error } = await mockService.auth.signIn(email, password);
      if (!error) {
        setUser(data.user);
        setProfile(data.profile);
      }
      return { error };
    }
  }

  async function signUp(email, password, fullName) {
    if (isSupabaseConfigured) {
      return supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName
          }
        }
      });
    } else {
      const profiles = JSON.parse(localStorage.getItem('wedding_profiles')) || [];
      const isFirstAdmin = email.toLowerCase().includes('haashid') || email.toLowerCase().startsWith('admin');
      const newUser = {
        id: `user-${email.split('@')[0]}-${Math.random().toString(36).substr(2, 5)}`,
        full_name: fullName,
        role: isFirstAdmin ? 'admin' : 'member',
        created_at: new Date().toISOString()
      };
      profiles.push(newUser);
      localStorage.setItem('wedding_profiles', JSON.stringify(profiles));

      const mockSession = {
        user: {
          id: newUser.id,
          email: email,
          user_metadata: { full_name: fullName }
        },
        profile: newUser
      };
      localStorage.setItem('wedding_session', JSON.stringify(mockSession));
      setUser(mockSession.user);
      setProfile(mockSession.profile);
      return { data: mockSession, error: null };
    }
  }

  async function signInWithGoogle() {
    if (isSupabaseConfigured) {
      return supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
    } else {
      const mockSession = {
        user: {
          id: 'user-google-demo',
          email: 'family.member@gmail.com',
          user_metadata: { full_name: 'Amina Khan (Google User)' }
        },
        profile: {
          id: 'user-google-demo',
          full_name: 'Amina Khan (Google User)',
          role: 'member',
          created_at: new Date().toISOString()
        }
      };
      
      const profiles = JSON.parse(localStorage.getItem('wedding_profiles')) || [];
      if (!profiles.some(p => p.id === 'user-google-demo')) {
        profiles.push(mockSession.profile);
        localStorage.setItem('wedding_profiles', JSON.stringify(profiles));
      }

      localStorage.setItem('wedding_session', JSON.stringify(mockSession));
      setUser(mockSession.user);
      setProfile(mockSession.profile);
      return { data: mockSession, error: null };
    }
  }

  async function signOut() {
    try {
      if (isSupabaseConfigured) {
        await supabase.auth.signOut();
      } else {
        await mockService.auth.signOut();
      }
    } catch (err) {
      console.warn('Error during signOut, forcing local state clear:', err);
    } finally {
      setUser(null);
      setProfile(null);
    }
  }

  const value = {
    user,
    profile,
    isAdmin,
    loading,
    isDemoMode,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    refetchProfile: () => {
      if (user) {
        if (isSupabaseConfigured) {
          fetchProfile(user.id);
        } else {
          mockService.auth.getSession().then(({ data: { session } }) => {
            if (session) setProfile(session.profile);
          });
        }
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
