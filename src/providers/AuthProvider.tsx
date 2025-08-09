
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { communityService } from '@/services/communityService';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const linkAnonymousProfile = async (user: User) => {
    const communityProfileId = localStorage.getItem('ceka_community_profile_id');
    
    if (communityProfileId) {
      try {
        await communityService.linkProfileToUser(communityProfileId, user.id);
        localStorage.removeItem('ceka_community_profile_id');
        
        toast({
          title: "Profile linked!",
          description: "Your community profile has been successfully linked to your account.",
        });
      } catch (error) {
        console.error('Error linking anonymous profile:', error);
        // Don't show error to user as this is not critical
      }
    } else if (user.email) {
      // Try to find and link existing anonymous profile by email
      try {
        const anonymousProfile = await communityService.findAnonymousProfileByEmail(user.email);
        if (anonymousProfile && anonymousProfile.id) {
          await communityService.linkProfileToUser(anonymousProfile.id, user.id);
          
          toast({
            title: "Welcome back!",
            description: "We found your previous community profile and linked it to your account.",
          });
        }
      } catch (error) {
        console.error('Error finding/linking anonymous profile:', error);
        // Don't show error to user as this is not critical
      }
    }
  };

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event: string, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);

        // Handle sign in events
        if (event === 'SIGNED_IN' && session?.user) {
          // Link anonymous profile if exists
          await linkAnonymousProfile(session.user);
          
          toast({
            title: "Welcome back!",
            description: "You have successfully signed in to CEKA.",
          });
        }

        // Show success toast for sign up
        if (event === 'SIGNED_UP' && session?.user) {
          // Link anonymous profile if exists
          await linkAnonymousProfile(session.user);
          
          toast({
            title: "Account created!",
            description: "Welcome to CEKA! Your account has been created successfully.",
          });
        }
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [toast]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl
      }
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Signed out",
      description: "You have been successfully signed out.",
    });
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
