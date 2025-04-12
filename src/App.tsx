
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createContext, useContext, useEffect, useState } from "react";
import { Session } from "@supabase/supabase-js";
import { supabase } from "./integrations/supabase/client";
import { LanguageProvider } from "./contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LegislativeTracker from "./pages/LegislativeTracker";
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

// Create a query client for React Query
const queryClient = new QueryClient();

// Create authentication context
export const AuthContext = createContext<{
  session: Session | null;
  loading: boolean;
}>({
  session: null,
  loading: true
});

export const useAuth = () => useContext(AuthContext);

const App = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ session, loading }}>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/legislative-tracker" element={<LegislativeTracker />} />
                <Route path="/resources" element={<ResourceHub />} />
                <Route path="/resources/:id" element={<ResourceDetail />} />
                <Route path="/resources/upload" element={<ResourceUpload />} />
                <Route path="/resources/pending" element={<PendingResources />} />
                <Route path="/resources/type/:type" element={<ResourceHub />} />
                <Route path="/constitution" element={<ConstitutionPage />} />
                <Route path="/community" element={<CommunityPortal />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/notifications" element={<Notifications />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
