
import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import AuthModal from '@/components/auth/AuthModal';
import Index from '@/pages/Index';
import AuthPage from '@/pages/AuthPage';
import Blog from '@/pages/Blog';
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

const ScrollToTop = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  return null;
};

const AppContent = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner text-primary"></span>
      </div>
    );
  }

  return (
    <Router>
      <AuthModal 
        open={false} 
        onOpenChange={() => {}} 
      />
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/blog/:slug" element={<ResourceDetail />} />
        <Route path="/resources" element={<ResourceLibrary />} />
        <Route path="/resources/:id" element={<ResourceDetail />} />
        <Route path="/resource-hub" element={<ResourceHub />} />
        <Route path="/legislative-tracker" element={<LegislativeTracker />} />
        <Route path="/legislative-tracker/:id" element={<LegislativeTrackerDetail />} />
        <Route path="/legislation/:id" element={<LegislationDetail />} />
        <Route path="/reject-finance-bill" element={<RejectFinanceBill />} />
        <Route path="/volunteer" element={<Volunteer />} />
        <Route path="/volunteer/apply/:id" element={<VolunteerApplication />} />
        <Route path="/profile" element={<UserProfile />} />
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
        <Route path="/resource-upload" element={<ResourceUpload />} />
        <Route path="/pending-resources" element={<PendingResources />} />
        <Route path="/thumbnail-demo" element={<ThumbnailDemo />} />
        <Route path="/settings" element={<SettingsLayout />}>
          <Route index element={<Settings />} />
          <Route path="account" element={<AccountSettings />} />
          <Route path="notifications" element={<NotificationSettings />} />
          <Route path="privacy" element={<PrivacySettings />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
};

export default App;
