
import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Toaster } from '@/components/ui/toaster';
import Layout from './components/layout/Layout';
import AuthPage from './pages/AuthPage';
import FeedbackPage from './pages/FeedbackPage';
import AccountSettings from './pages/settings/AccountSettings';
import NotificationSettings from './pages/settings/NotificationSettings';
import PrivacySettings from './pages/settings/PrivacySettings';
import SettingsLayout from './pages/settings/SettingsLayout';
import DocumentViewerPage from './pages/DocumentViewerPage';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

// Import renamed files or create necessary aliases
import Index from './pages/Index'; // For HomePage
import CommunityPortal from './pages/CommunityPortal'; // For CommunityPortalPage
import ResourceHub from './pages/ResourceLibrary'; // For ResourceHubPage, using ResourceLibrary
import LegislativeTracker from './pages/LegislativeTracker'; // For LegislativeTrackerPage
import JoinCommunity from './pages/JoinCommunity'; // For VolunteerPage or similar
import Notifications from './pages/Notifications'; // Assuming correct path
import UserProfile from './pages/UserProfile'; // Assuming this is the correct file
import ResourceUpload from './pages/ResourceUpload'; // Assuming correct path

// Create and export auth context
interface AuthContextType {
  session: Session | null;
  user: any;
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (email: string, password: string, metadata: any) => Promise<any>;
  signOut: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (error: any) {
        console.error('Error retrieving session:', error.message);
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false);
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (error) throw error;
      return data;
    } catch (error: any) {
      setError(error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error during sign out:', error);
    }
  };

  const authValue = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthContext.Provider value={authValue}>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/community" element={<CommunityPortal />} />
            <Route path="/resources" element={<ResourceHub />} />
            <Route path="/resources/:id" element={<DocumentViewerPage />} />
            <Route path="/resources/upload" element={<ResourceUpload />} />
            <Route path="/legislative-tracker" element={<LegislativeTracker />} />
            <Route path="/volunteer" element={<JoinCommunity />} />
            <Route path="/auth" element={
              <Layout>
                <AuthPage />
              </Layout>
            } />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<UserProfile />} />
            <Route path="/search" element={<SearchResults />} />
            
            <Route path="/settings" element={<SettingsLayout />}>
              <Route index element={<Navigate to="/settings/account" replace />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="privacy" element={<PrivacySettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </AuthContext.Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
