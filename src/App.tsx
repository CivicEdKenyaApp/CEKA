
import React, { useState, useEffect } from 'react';
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
import CampaignDetail from './pages/CampaignDetail';
import DiscussionDetail from './pages/DiscussionDetail';
import LegislationDetail from './pages/LegislationDetail';
import LegalPage from './pages/LegalPage';
import Index from './pages/Index';
import Community from './pages/Community';
import ResourceHub from './pages/ResourceHub';
import ResourceUpload from './pages/ResourceUpload';
import ResourceLibrary from './pages/ResourceLibrary';
import LegislativeTracker from './pages/LegislativeTracker';
import RejectFinanceBill from './pages/RejectFinanceBill';
import JoinCommunity from './pages/JoinCommunity';
import Notifications from './pages/Notifications';
import UserProfile from './pages/UserProfile';
import ThumbnailDemoPage from './pages/ThumbnailDemoPage';
import SplashScreen from '@/components/SplashScreen';
import { AuthContext, AuthContextType } from '@/contexts/AuthContext';

// ScrollToTopWrapper component to ensure all routes scroll to top when navigated
const ScrollToTopWrapper = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  
  return null;
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<any>(null); // Consider replacing 'any'
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    // Hide splash screen after 3 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        setLoading(true); // Ensure loading is true at the start
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (e: any) {
        console.error('Error retrieving session:', e.message);
        // setError(e.message); // Optionally set error state
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, newSession) => { // Make callback non-async directly
        setSession(newSession);
        setUser(newSession?.user || null);
        setLoading(false); // Ensure loading is set to false after auth state changes
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      // setUser(data.user); // session will be updated by onAuthStateChange
      // setSession(data.session);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setLoading(true);
      setError(null);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (signUpError) throw signUpError;
      // setUser(data.user); // session will be updated by onAuthStateChange
      // setSession(data.session);
      return data;
    } catch (e: any) {
      setError(e.message);
      throw e;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      // setUser(null); // session will be updated by onAuthStateChange
      // setSession(null);
    } catch (e: any) {
      console.error('Error during sign out:', e.message);
      // setError(e.message); // Optionally set error state
    } finally {
      setLoading(false);
    }
  };

  const authValue: AuthContextType = {
    session,
    user,
    signIn,
    signUp,
    signOut,
    loading,
    error,
  };

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) { // Show loading indicator while checking session
      return <SplashScreen />; // Or some other loading component
    }
    if (!session) {
      // Redirect to login if not authenticated
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    return <>{children}</>;
  };

  if (showSplash || (loading && !session)) { // Keep splash if showSplash or initial loading without session
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthContext.Provider value={authValue}>
          {/* Global ScrollToTop to ensure pages always start at the top */}
          <ScrollToTopWrapper />
          <div className="App">
          
          <Routes>
            <Route path="/" element={<Index />} />
            
            {/* Community routes (formerly blog) */}
            <Route path="/community" element={<Community />} />
            <Route path="/blog" element={<Navigate to="/community" replace />} />
            <Route path="/community/discussions/:id" element={<DiscussionDetail />} />
            <Route path="/community/campaigns/:id" element={<CampaignDetail />} />
            
            {/* Resources routes */}
            <Route path="/resources" element={<ResourceHub />} />
            <Route path="/resources/library" element={<ResourceLibrary />} />
            <Route path="/resources/:id" element={<DocumentViewerPage />} />
            <Route path="/resources/upload" element={<ResourceUpload />} />
            
            {/* Legislative tracker routes */}
            <Route path="/legislative-tracker" element={<LegislativeTracker />} />
            <Route path="/legislative-tracker/:id" element={<LegislationDetail />} />
            <Route path="/reject-finance-bill" element={<RejectFinanceBill />} />
            
            <Route path="/thumbnail-demo" element={<ThumbnailDemoPage />} />
            
            <Route path="/volunteer" element={<JoinCommunity />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/feedback" element={<FeedbackPage />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            } />
            <Route path="/search" element={<SearchResults />} />
            
            {/* Legal pages */}
            <Route path="/privacy" element={<LegalPage />} />
            <Route path="/terms" element={<LegalPage />} />
            
            {/* Settings routes */}
            <Route path="/settings" element={
              <ProtectedRoute>
                <SettingsLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="/settings/account" replace />} />
              <Route path="account" element={<AccountSettings />} />
              <Route path="notifications" element={<NotificationSettings />} />
              <Route path="privacy" element={<PrivacySettings />} />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
            </div>
          <Toaster />
        </AuthContext.Provider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
