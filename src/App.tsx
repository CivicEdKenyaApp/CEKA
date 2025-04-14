
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LegislativeTracker from "./pages/LegislativeTracker";
import LegislativeTrackerDetail from "./pages/LegislativeTrackerDetail";
import ResourceHub from "./pages/ResourceHub";
import ResourceDetail from "./pages/ResourceDetail";
import ResourceUpload from "./pages/ResourceUpload";
import PendingResources from "./pages/PendingResources";
import CommunityPortal from "./pages/CommunityPortal";
import Volunteer from "./pages/Volunteer";
import UserProfile from "./pages/UserProfile";
import AuthPage from "./pages/AuthPage";
import Notifications from "./pages/Notifications";
import ConstitutionPage from "./pages/ConstitutionPage";
import JoinCommunity from "./pages/JoinCommunity";
import VolunteerApplication from "./pages/VolunteerApplication";
import Settings from "./pages/Settings";
import ScrollToTop from "./components/utils/ScrollToTop";
import LoadingScreen from "./components/utils/LoadingScreen";
import PullToRefresh from "./components/PullToRefresh";

const queryClient = new QueryClient();

export const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
}>({
  session: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

const BackButtonHandler = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    window.addEventListener('popstate', (e) => {
      e.preventDefault();
      navigate(-1);
    });

    return () => {
      window.removeEventListener('popstate', () => {});
    };
  }, [navigate]);

  return <>{children}</>;
};

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ session, loading }}>
        <ThemeProvider>
          <LanguageProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <BackButtonHandler>
                  <ScrollToTop />
                  <LoadingScreen />
                  <PullToRefresh>
                    <Routes>
                      <Route path="/" element={<Index />} />
                      <Route path="/legislative-tracker" element={<LegislativeTracker />} />
                      <Route path="/legislative-tracker/:id" element={<LegislativeTrackerDetail />} />
                      <Route path="/resources" element={<ResourceHub />} />
                      <Route path="/resources/:id" element={<ResourceDetail />} />
                      <Route path="/resources/upload" element={<ResourceUpload />} />
                      <Route path="/resources/pending" element={<PendingResources />} />
                      <Route path="/resources/type/:type" element={<ResourceHub />} />
                      <Route path="/constitution" element={<ConstitutionPage />} />
                      <Route path="/community" element={<CommunityPortal />} />
                      <Route path="/volunteer" element={<Volunteer />} />
                      <Route path="/community/join" element={<JoinCommunity />} />
                      <Route path="/volunteer/apply/:role" element={<VolunteerApplication />} />
                      <Route path="/profile" element={<UserProfile />} />
                      <Route path="/auth" element={<AuthPage />} />
                      <Route path="/notifications" element={<Notifications />} />
                      <Route path="/settings" element={<Settings />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </PullToRefresh>
                </BackButtonHandler>
              </BrowserRouter>
            </TooltipProvider>
          </LanguageProvider>
        </ThemeProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
