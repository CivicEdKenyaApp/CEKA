import { Suspense, lazy } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoadingScreen from '@/components/LoadingScreen';
import { AuthProvider } from '@/providers/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';

const Index = lazy(() => import('@/pages/Index'));
const AuthPage = lazy(() => import('@/pages/AuthPage')); // Restored AuthPage
const CivicEducation = lazy(() => import('@/pages/CivicEducation'));
const LegislativeTracker = lazy(() => import('@/pages/LegislativeTracker'));
const ResourceDetail = lazy(() => import('@/pages/ResourceDetail'));
const MegaResources = lazy(() => import('@/pages/MegaResources'));
const JoinCommunity = lazy(() => import('@/pages/JoinCommunity'));
const BillDetail = lazy(() => import('@/pages/BillDetail'));
const LegislationDetail = lazy(() => import('@/pages/LegislationDetail'));
const LegislativeTrackerDetail = lazy(() => import('@/pages/LegislativeTrackerDetail'));
const CampaignDetail = lazy(() => import('@/pages/CampaignDetail'));
const ConstitutionPage = lazy(() => import('@/pages/ConstitutionPage'));
const SearchResults = lazy(() => import('@/pages/SearchResults'));
const NotFound = lazy(() => import('@/pages/NotFound'));
const Feedback = lazy(() => import('@/pages/Feedback'));
const ResourceUpload = lazy(() => import('@/pages/ResourceUpload'));
const EventsCalendar = lazy(() => import('@/pages/EventsCalendar'));
const AdvocacyToolkit = lazy(() => import('@/pages/AdvocacyToolkit'));
const AdvocacyToolkitDetail = lazy(() => import('@/pages/AdvocacyToolkitDetail'));
const ProfileSettings = lazy(() => import('@/pages/ProfileSettings'));
const Blog = lazy(() => import('@/pages/Blog'));
const BlogPost = lazy(() => import('@/pages/BlogPost'));
const UserProfile = lazy(() => import('@/pages/UserProfile'));
const Volunteer = lazy(() => import('@/pages/Volunteer'));
const VolunteerApplication = lazy(() => import('@/pages/VolunteerApplication'));
const VolunteerSubmit = lazy(() => import('@/pages/VolunteerSubmit'));
const AdminDashboard = lazy(() => import('@/pages/AdminDashboard'));
const ThumbnailDemo = lazy(() => import('@/pages/ThumbnailDemo'));
const ThumbnailDemoPage = lazy(() => import('@/pages/ThumbnailDemoPage'));
const LegalPage = lazy(() => import('@/pages/LegalPage'));
const RejectFinanceBill = lazy(() => import('@/pages/RejectFinanceBill'));
const FeedbackPage = lazy(() => import('@/pages/FeedbackPage'));
const Settings = lazy(() => import('@/pages/Settings'));
const Notifications = lazy(() => import('@/pages/Notifications'));
const DocumentViewerPage = lazy(() => import('@/pages/DocumentViewerPage'));
const DiscussionDetail = lazy(() => import('@/pages/DiscussionDetail'));
const PendingResources = lazy(() => import('@/pages/PendingResources'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <TooltipProvider>
              <Router>
                <div className="min-h-screen bg-background font-sans antialiased">
                  <Suspense fallback={<LoadingScreen />}>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/civic-education" element={<CivicEducation />} />
                      <Route path="/legislative-tracker" element={<LegislativeTracker />} />
                      <Route path="/resources" element={<MegaResources />} />
                      <Route path="/resources/:id" element={<MegaResources />} />
                      <Route path="/resource-library" element={<MegaResources />} />
                      <Route path="/resource-hub" element={<MegaResources />} />
                      <Route path="/resource-detail/:id" element={<ResourceDetail />} />
                      <Route path="/document-viewer/:id" element={<DocumentViewerPage />} />
                      <Route path="/join-community" element={<JoinCommunity />} />
                      <Route path="/bills/:id" element={<BillDetail />} />
                      <Route path="/legislation/:id" element={<LegislationDetail />} />
                      <Route path="/legislative-tracker/:id" element={<LegislativeTrackerDetail />} />
                      <Route path="/campaigns/:id" element={<CampaignDetail />} />
                      <Route path="/constitution" element={<ConstitutionPage />} />
                      <Route path="/search" element={<SearchResults />} />
                      <Route path="/feedback" element={<Feedback />} />
                      <Route path="/resource-upload" element={<ResourceUpload />} />
                      <Route path="/events" element={<EventsCalendar />} />
                      <Route path="/advocacy-toolkit" element={<AdvocacyToolkit />} />
                      <Route path="/advocacy-toolkit/:id" element={<AdvocacyToolkitDetail />} />
                      <Route path="/profile" element={<ProfileSettings />} />
                      <Route path="/blog" element={<Blog />} />
                      <Route path="/blog/:slug" element={<BlogPost />} />
                      <Route path="/user/:id" element={<UserProfile />} />
                      <Route path="/volunteer" element={<Volunteer />} />
                      <Route path="/volunteer/:id" element={<VolunteerApplication />} />
                      <Route path="/volunteer-submit" element={<VolunteerSubmit />} />
                      <Route path="/admin" element={<AdminDashboard />} />
                      <Route path="/thumbnail-demo" element={<ThumbnailDemo />} />
                      <Route path="/thumbnail-demo-page" element={<ThumbnailDemoPage />} />
                      <Route path="/legal" element={<LegalPage />} />
                      <Route path="/reject-finance-bill" element={<RejectFinanceBill />} />
                      <Route path="/feedback-page" element={<FeedbackPage />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/discussions/:id" element={<DiscussionDetail />} />
                      <Route path="/pending-resources" element={<PendingResources />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <Toaster />
                </div>
              </Router>
            </TooltipProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
