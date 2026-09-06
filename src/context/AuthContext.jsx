import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [role, setRole] = useState(null);
  const [profileError, setProfileError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch profile from `profiles` table
  const fetchProfile = async (userId, userObj = null) => {
    if (!userId) {
      setProfile(null);
      setRole(null);
      setProfileError(null);
      return { data: null, error: null };
    }
    try {
      console.log('[Auth] Fetching profile for user ID:', userId);
      const { data, error, status } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('[Auth] Profile query failed:', {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint,
          status,
          userId,
        });
        setProfile(null);
        setRole(null);
        const errMsg = `Profile query failed: ${error.message} (Code: ${error.code || status})`;
        setProfileError(errMsg);
        return { data: null, error };
      }

      if (data) {
        console.log('[Auth] Profile loaded successfully from DB:', { userId, role: data.role });
        const rawRole = data.role || userObj?.user_metadata?.role || userObj?.app_metadata?.role;
        const resolvedRole = rawRole ? String(rawRole).trim().toLowerCase() : null;

        const normalised = {
          ...data,
          name: data.full_name || data.email || userObj?.email,
          avatar: data.avatar_url,
          role: resolvedRole,
        };

        if (resolvedRole === 'organizer' || resolvedRole === 'attendee') {
          setProfile(normalised);
          setRole(resolvedRole);
          setProfileError(null);
          return { data: normalised, error: null };
        }

        console.warn('[Auth] Profile row has unassigned/unrecognized role:', data.role);
        setProfile(normalised);
        setRole(null);
        setProfileError(`Account has unassigned or unrecognized role: "${data.role}"`);
        return { data: normalised, error: new Error('Unrecognized role') };
      }

      // No profile row returned in public.profiles
      console.warn('[Auth] No profile row found in profiles table for user ID:', userId);
      const metadataRole = (userObj?.user_metadata?.role || userObj?.app_metadata?.role || '').trim().toLowerCase();
      if (metadataRole === 'organizer' || metadataRole === 'attendee') {
        console.log('[Auth] Resolved role from user auth metadata fallback:', metadataRole);
        const metaProfile = {
          id: userId,
          email: userObj?.email,
          name: userObj?.user_metadata?.full_name || userObj?.email,
          role: metadataRole,
        };
        setProfile(metaProfile);
        setRole(metadataRole);
        setProfileError(null);
        return { data: metaProfile, error: null };
      }

      setProfile(null);
      setRole(null);
      setProfileError('Profile record not found for this account.');
      return { data: null, error: new Error('Profile record not found') };
    } catch (err) {
      console.error('[Auth] Unexpected error fetching profile:', err);
      setProfile(null);
      setRole(null);
      setProfileError(err.message || 'Unexpected error fetching profile');
      return { data: null, error: err };
    }
  };

  useEffect(() => {
    // Initial session retrieval
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setUser(currentSession?.user ?? null);
      if (currentSession?.user) {
        await fetchProfile(currentSession.user.id, currentSession.user);
      }
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        if (newSession?.user) {
          await fetchProfile(newSession.user.id, newSession.user);
        } else {
          setProfile(null);
          setRole(null);
          setProfileError(null);
        }
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    setLoading(true);
    setProfileError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      if (data?.user) {
        setSession(data.session);
        setUser(data.user);
        const profileRes = await fetchProfile(data.user.id, data.user);
        return { user: data.user, session: data.session, profile: profileRes?.data, error: profileRes?.error };
      }
      return data;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) console.error('[Auth] Sign out error:', error);
    } catch (err) {
      console.error('[Auth] Sign out exception:', err);
    } finally {
      setSession(null);
      setUser(null);
      setProfile(null);
      setRole(null);
      setProfileError(null);
    }
  };

  const refreshProfile = () => {
    if (user?.id) {
      return fetchProfile(user.id, user);
    }
    return Promise.resolve(null);
  };

  const value = {
    session,
    user,
    profile,
    role,
    loading,
    profileError,
    isAuthenticated: !!session?.user,
    signIn,
    signUp,
    signOut,
    refreshProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}
