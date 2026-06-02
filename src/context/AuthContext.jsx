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
    if (isSupabaseConfigured) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setLoading(false);
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (_event, session) => {
          setUser(session?.user ?? null);
          if (session?.user) await fetchProfile(session.user.id);
          else { setProfile(null); setLoading(false); }
        }
      );
      return () => subscription.unsubscribe();
    } else {
      // Mock mode initialization
      mockService.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setUser(session.user);
          setProfile(session.profile);
        }
        setLoading(false);
      });
    }
  }, []);

  async function fetchProfile(userId) {
    try {
      if (isSupabaseConfigured) {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();
        
        if (error) throw error;
        setProfile(data);
      }
    } catch (err) {
      console.error('Error fetching profile:', err.message);
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
    if (isSupabaseConfigured) {
      await supabase.auth.signOut();
    } else {
      await mockService.auth.signOut();
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

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
export default AuthContext;
