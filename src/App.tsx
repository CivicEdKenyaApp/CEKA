
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
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
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

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
                <Route path="/legislative-tracker" element={
                  <ProtectedRoute>
                    <LegislativeTracker />
                  </ProtectedRoute>
                } />
                <Route path="/resources" element={
                  <ProtectedRoute>
                    <ResourceHub />
                  </ProtectedRoute>
                } />
                <Route path="/resources/:id" element={
                  <ProtectedRoute>
                    <ResourceDetail />
                  </ProtectedRoute>
                } />
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
                <Route path="/resources/type/:type" element={
                  <ProtectedRoute>
                    <ResourceHub />
                  </ProtectedRoute>
                } />
                <Route path="/constitution" element={
                  <ProtectedRoute>
                    <ConstitutionPage />
                  </ProtectedRoute>
                } />
                <Route path="/community" element={
                  <ProtectedRoute>
                    <CommunityPortal />
                  </ProtectedRoute>
                } />
                <Route path="/volunteer" element={
                  <ProtectedRoute>
                    <Volunteer />
                  </ProtectedRoute>
                } />
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                } />
                <Route path="/auth" element={<AuthPage />} />
                <Route path="/notifications" element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                } />
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

// Protected route component
const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { session, loading } = useAuth();
  
  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <Navigate to="/" />;
  }
  
  return children;
};

export default App;
