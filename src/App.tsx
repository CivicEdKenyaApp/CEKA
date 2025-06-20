
import React, { useState, useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider } from '@/providers/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { Toaster } from '@/components/ui/toaster';
import ScrollListener from '@/components/auth/ScrollListener';
import AuthModal from '@/components/auth/AuthModal';
import WelcomeTour from '@/components/tour/WelcomeTour';
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Blog from '@/pages/Blog';
import BlogPost from '@/pages/BlogPost';
import AdminDashboard from '@/pages/AdminDashboard';
import ResourceLibrary from '@/pages/ResourceLibrary';
import ResourceDetail from '@/pages/ResourceDetail';
import ResourceHub from '@/pages/ResourceHub';
import LegislativeTracker from '@/pages/LegislativeTracker';
import LegislativeTrackerDetail from '@/pages/LegislativeTrackerDetail';
import LegislationDetail from '@/pages/LegislationDetail';
import RejectFinanceBill from '@/pages/RejectFinanceBill';
import Volunteer from '@/pages/Volunteer';
import VolunteerApplication from '@/pages/VolunteerApplication';
import UserProfile from '@/pages/UserProfile';
import ProfileSettings from '@/pages/ProfileSettings';
import Notifications from '@/pages/Notifications';
import AdvocacyToolkit from '@/pages/AdvocacyToolkit';
import AdvocacyToolkitDetail from '@/pages/AdvocacyToolkitDetail';
import JoinCommunity from '@/pages/JoinCommunity';
import ConstitutionPage from '@/pages/ConstitutionPage';
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
import NotFound from '@/pages/NotFound';
import { useAuth } from '@/providers/AuthProvider';

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const AppContent: React.FC = () => {
  const { session } = useAuth();
  const [showWelcomeTour, setShowWelcomeTour] = useState(false);

  useEffect(() => {
    // Show welcome tour for new authenticated users
    if (session) {
      const hasSeenTour = localStorage.getItem('ceka-welcome-tour-seen');
      if (!hasSeenTour) {
        setShowWelcomeTour(true);
      }
    }
  }, [session]);

  const handleTourComplete = () => {
    localStorage.setItem('ceka-welcome-tour-seen', 'true');
    setShowWelcomeTour(false);
  };

  return (
    <>
      <ScrollToTop />
      {showWelcomeTour && <WelcomeTour onComplete={handleTourComplete} />}
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<BlogPost />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/resources" element={<ResourceLibrary />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/resources/upload" element={<ResourceUpload />} />
        <Route path="/resources/pending" element={<PendingResources />} />
        <Route path="/resource-hub" element={<ResourceHub />} />
        <Route path="/legislative-tracker" element={<LegislativeTracker />} />
        <Route path="/legislative-tracker/:id" element={<LegislativeTrackerDetail />} />
        <Route path="/legislation/:id" element={<LegislationDetail />} />
        <Route path="/reject-finance-bill" element={<RejectFinanceBill />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/volunteer/apply/:id" element={<VolunteerApplication />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/profile/settings" element={<ProfileSettings />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/advocacy-toolkit" element={<AdvocacyToolkit />} />
        <Route path="/advocacy-toolkit/:id" element={<AdvocacyToolkitDetail />} />
        <Route path="/join-community" element={<JoinCommunity />} />
        <Route path="/constitution" element={<ConstitutionPage />} />
        <Route path="/legal" element={<LegalPage />} />
        <Route path="/feedback" element={<FeedbackPage />} />
        <Route path="/discussion/:id" element={<DiscussionDetail />} />
        <Route path="/campaign/:id" element={<CampaignDetail />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/document/:id" element={<DocumentViewerPage />} />
        <Route path="/thumbnail-demo" element={<ThumbnailDemo />} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Settings />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="privacy" element={<PrivacySettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster />
    </>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <ScrollListener>
            <AuthModal 
              open={false} 
              onOpenChange={() => {}} 
            />
            <AppContent />
          </ScrollListener>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
