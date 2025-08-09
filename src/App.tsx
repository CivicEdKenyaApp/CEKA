import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Index from '@/pages/Index';
import Resources from '@/pages/Resources';
import ResourceDetail from '@/pages/ResourceDetail';
import JoinCommunity from '@/pages/JoinCommunity';
import Community from '@/pages/Community';
import Auth from '@/pages/Auth';
import Feedback from '@/pages/Feedback';
import Volunteer from '@/pages/Volunteer';
import { AuthProvider } from '@/providers/AuthProvider';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { Toaster } from '@/components/ui/toaster';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import DocumentViewerPage from '@/pages/DocumentViewerPage';

const queryClient = new QueryClient();

import VolunteerSubmit from '@/pages/VolunteerSubmit';

const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <ThemeProvider>
            <QueryClientProvider client={queryClient}>
              <Toaster />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/resources" element={<Resources />} />
                <Route path="/resources/:id" element={<ResourceDetail />} />
                <Route path="/document/:id" element={<DocumentViewerPage />} />
                <Route path="/join" element={<JoinCommunity />} />
                <Route path="/community" element={<Community />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/feedback" element={<Feedback />} />
                <Route path="/volunteer" element={<Volunteer />} />
                <Route path="/volunteer/submit" element={<VolunteerSubmit />} />
              </Routes>
            </QueryClientProvider>
          </ThemeProvider>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
