import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

import Index from "./pages/Index";
import Auth from "./pages/Auth";
import AuthPage from "./pages/AuthPage";
import UserProfile from "./pages/UserProfile";
import JoinCommunity from "./pages/JoinCommunity";
import VolunteerSubmit from "./pages/VolunteerSubmit";
import Resources from "./pages/Resources";
import LegislativeTracker from "./pages/LegislativeTracker";
import Blog from "./pages/Blog";
import CivicEducation from "./pages/CivicEducation";
import Volunteer from "./pages/Volunteer";
import NotFound from "./pages/NotFound";
import MegaResources from '@/pages/MegaResources';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
             <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/auth-page" element={<AuthPage />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/join-community" element={<JoinCommunity />} />
                <Route path="/volunteer/submit" element={<VolunteerSubmit />} />
                <Route path="/resources" element={<MegaResources />} />
                <Route path="/resources/:id" element={<MegaResources />} />
                <Route path="/resource-hub" element={<MegaResources />} />
                <Route path="/resource-library" element={<MegaResources />} />
                <Route path="/legislative-tracker" element={<LegislativeTracker />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/civic-education" element={<CivicEducation />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
          </TooltipProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
