
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/providers/AuthProvider";
import Index from "./pages/Index";
import Resources from "./pages/Resources";
import DocumentViewerPage from "./pages/DocumentViewerPage";
import LegislativeTracker from "./pages/LegislativeTracker";
import LegislativeTrackerDetail from "./pages/LegislativeTrackerDetail";
import BillDetail from "./pages/BillDetail";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import CivicEducation from "./pages/CivicEducation";
import Volunteer from "./pages/Volunteer";
import EventsCalendar from "./pages/EventsCalendar";
import Feedback from "./pages/Feedback";
import Auth from "./pages/Auth";
import AdminDashboard from "./pages/admin/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/resources/:id" element={<DocumentViewerPage />} />
            <Route path="/legislative-tracker" element={<LegislativeTracker />} />
            <Route path="/legislative-tracker/:id" element={<LegislativeTrackerDetail />} />
            <Route path="/bill/:id" element={<BillDetail />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
            <Route path="/civic-education" element={<CivicEducation />} />
            <Route path="/volunteer" element={<Volunteer />} />
            <Route path="/events" element={<EventsCalendar />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
