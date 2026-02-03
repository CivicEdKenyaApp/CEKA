import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation, Navigate, BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/providers/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import ScrollListener from '@/components/auth/ScrollListener';
import AuthModal from '@/components/auth/AuthModal';
import WelcomeTour from '@/components/tour/WelcomeTour';
import SplashScreen from '@/components/SplashScreen';
import { useAuth } from '@/providers/AuthProvider';

// Pages
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import EventsCalendar from '@/pages/CivicCalendar';
import AdminDashboard from '@/pages/AdminDashboard';
import ResourceLibrary from '@/pages/ResourceLibrary';
import ResourceDetail from '@/pages/ResourceDetail';
import OAuthConsent from '@/pages/OAuthConsent';
import LegislativeTracker from '@/pages/LegislativeTracker';
import LegislativeTrackerDetail from '@/pages/LegislativeTrackerDetail';
import LegislationDetail from '@/pages/LegislationDetail';
import BillDetail from '@/pages/BillDetail';
import RejectFinanceBill from '@/pages/RejectFinanceBill';
import SHAmbles from '@/pages/SHAmbles';
import PeoplesAuditPage from '@/pages/PeoplesAuditPage';
import NasakaPage from '@/pages/NasakaIEBCPage';
// Volunteer pages removed - functionality merged into JoinCommunity
import UserProfile from '@/pages/UserProfile';
import ProfileSettings from '@/pages/ProfileSettings';
import Notifications from '@/pages/Notifications';
import AdvocacyToolkit from '@/pages/AdvocacyToolkit';
import AdvocacyToolkitDetail from '@/pages/AdvocacyToolkitDetail';
import JoinCommunity from '@/pages/JoinCommunity';
import ConstitutionPage from '@/pages/ConstitutionPage';
import CommunityPortal from '@/pages/CommunityPortal';
import LegalPage from '@/pages/LegalPage';
import FeedbackPage from '@/pages/FeedbackPage';
import DiscussionDetail from '@/pages/DiscussionDetail';
import CampaignDetail from '@/pages/CampaignDetail';
import SearchResults from '@/pages/SearchResults';
import DocumentViewerPage from '@/pages/DocumentViewerPage';
import ResourceUpload from '@/pages/ResourceUpload';
import PendingResources from '@/pages/PendingResources';
import ThumbnailDemo from '@/pages/ThumbnailDemo';
import SettingsLayout from '@/pages/settings/SettingsLayout';
import Settings from '@/pages/Settings';
import AccountSettings from '@/pages/settings/AccountSettings';
import NotificationSettings from '@/pages/settings/NotificationSettings';
import PrivacySettings from '@/pages/settings/PrivacySettings';
import PrivacyPolicy from '@/pages/PrivacyPolicy';
import TermsConditions from '@/pages/TermsConditions';
import NotFound from '@/pages/NotFound';

const queryClient = new QueryClient();

const ScrollToTop = () => {
  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  return null;
};

// Protected route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

const AppContent = () => {
  const { session } = useAuth();
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2 seconds
    const splashTimer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);

    return () => clearTimeout(splashTimer);
  }, []);

  useEffect(() => {
    if (session && !showSplash) {
      const hasSeenTour = localStorage.getItem('ceka-welcome-tour-seen');
      if (!hasSeenTour) {
        setShowWelcomeTour(true);
      }
    }
  }, [session, showSplash]);

  const handleTourComplete = () => {
    localStorage.setItem('ceka-welcome-tour-seen', 'true');
    setShowWelcomeTour(false);
  };

  return (
    <>
      {showSplash && <SplashScreen />}
      <ScrollToTop />
      {showWelcomeTour && <WelcomeTour onComplete={handleTourComplete} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/calendar" element={<EventsCalendar />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/resources" element={<ResourceLibrary />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/resources/type/:type" element={<ResourceLibrary />} />
        <Route path="/resources/upload" element={
          <ProtectedRoute>
            <ResourceUpload />
          </ProtectedRoute>
        } />
        <Route path="/resources/pending" element={
          <ProtectedRoute>
            <PendingResources />
          </ProtectedRoute>
        } />
        <Route path="/resource-hub" element={<Navigate to="/resources" replace />} />
        <Route path="/oauth/consent" element={<OAuthConsent />} />
        <Route path="/legislative-tracker" element={<LegislativeTracker />} />
        <Route path="/legislative-tracker/:id" element={<LegislativeTrackerDetail />} />
        <Route path="/legislation/:id" element={<LegislationDetail />} />
        <Route path="/bill/:id" element={<BillDetail />} />
        <Route path="/reject-finance-bill" element={<RejectFinanceBill />} />
        <Route path="/shambles" element={<SHAmbles />} />
        <Route path="/peoples-audit" element={<PeoplesAuditPage />} />
        <Route path="/nasaka" element={<Navigate to="/nasaka-iebc" replace />} />
        <Route path="/nasaka-iebc" element={<NasakaPage />} />
        <Route path="/civic-calendar" element={<Navigate to="/calendar" replace />} />
        {/* Volunteer routes redirect to join-community */}
        <Route path="/volunteer" element={<Navigate to="/join-community?tab=volunteer" replace />} />
        <Route path="/volunteer/apply/:id" element={<Navigate to="/join-community?tab=volunteer" replace />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>
        } />
        <Route path="/profile/settings" element={
          <ProtectedRoute>
            <ProfileSettings />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>
        } />
        <Route path="/advocacy-toolkit" element={<AdvocacyToolkit />} />
        <Route path="/advocacy-toolkit/:id" element={<AdvocacyToolkitDetail />} />
        <Route path="/join-community" element={<JoinCommunity />} />
        <Route path="/constitution" element={<ConstitutionPage />} />
        <Route path="/community" element={<CommunityPortal />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/discussion/:id" element={<DiscussionDetail />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/document/:id" element={<DocumentViewerPage />} />
        <Route path="/thumbnail-demo" element={<ThumbnailDemo />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsConditions />} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Settings />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="privacy" element={<PrivacySettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
      <Sonner />
    </>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <ScrollListener>
                <AuthModal open={false} onOpenChange={() => { }} />
                <AppContent />
              </ScrollListener>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
