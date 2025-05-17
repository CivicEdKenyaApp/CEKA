import React, { useState, useEffect, createContext, useContext } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';
import { Toaster } from '@/components/ui/toaster';
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
import SplashScreen from './components/SplashScreen';

// Import renamed files or create necessary aliases
import Index from './pages/Index';
import CommunityPortal from './pages/CommunityPortal';
import ResourceLibrary from './pages/ResourceLibrary';
import LegislativeTracker from './pages/LegislativeTracker';
import JoinCommunity from './pages/JoinCommunity';
import Notifications from './pages/Notifications';
import UserProfile from './pages/UserProfile';
import ResourceUpload from './pages/ResourceUpload';

// Create and export auth context
interface AuthContextType {
  session: Session | null;
  user: any; // Consider defining a more specific User type
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
  const [user, setUser] = useState<any>(null); // Consider User type
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const location = useLocation();
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // Reduced splash screen time
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const getSession = async () => {
      try {
        const { data, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        setSession(data.session);
        setUser(data.session?.user || null);
      } catch (err: any) {
        console.error('Error retrieving session:', err.message);
        // setError(err.message); // Optionally set error state
      } finally {
        setLoading(false);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user || null);
        if (_event !== 'INITIAL_SESSION') { // Avoid double setLoading(false) on init
             setLoading(false);
        }
      }
    );

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (signInError) throw signInError;
      // setSession(data.session); // Handled by onAuthStateChange
      // setUser(data.user); // Handled by onAuthStateChange
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, metadata: any) => {
    try {
      setError(null);
      setLoading(true);
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: metadata,
        },
      });
      if (signUpError) throw signUpError;
      // setSession(data.session); // Handled by onAuthStateChange
      // setUser(data.user); // Handled by onAuthStateChange
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      // setSession(null); // Handled by onAuthStateChange
      // setUser(null); // Handled by onAuthStateChange
    } catch (err: any) {
      console.error('Error during sign out:', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
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

  // Protected route component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (loading) {
      // Optionally show a loading spinner or skeleton screen
      return <SplashScreen />; // Or a more lightweight loading indicator
    }
    if (!session) {
      // Redirect to login if not authenticated
      return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
  };

  if (showSplash || (loading && !session)) { // Keep splash if loading initial session
    return <SplashScreen />;
  }

  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthContext.Provider value={authValue}>
          {/* Global ScrollToTop to ensure pages always start at the top */}
          <ScrollToTopWrapper />
          <div className="App flex flex-col min-h-screen">
            <Routes>
              <Route path="/" element={<Index />} />
              
              {/* Community routes */}
              <Route path="/community" element={<CommunityPortal />} />
              <Route path="/community/discussions/:id" element={<DiscussionDetail />} />
              <Route path="/community/campaigns/:id" element={<CampaignDetail />} />
              
              {/* Resources routes */}
              <Route path="/resources" element={<ResourceLibrary />} />
              <Route path="/resources/:id" element={<DocumentViewerPage />} />
              <Route path="/resources/upload" element={
                <ProtectedRoute>
                  <ResourceUpload />
                </ProtectedRoute>
              } />
              
              {/* Legislative tracker routes */}
              <Route path="/legislative-tracker" element={<LegislativeTracker />} />
              <Route path="/legislative-tracker/:id" element={<LegislationDetail />} />
              
              <Route path="/volunteer" element={<JoinCommunity />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="/notifications" element={
                <ProtectedRoute>
                  <Notifications />
                </ProtectedRoute>
              } />
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
                <Route index element={<Navigate to="account" replace />} />
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
