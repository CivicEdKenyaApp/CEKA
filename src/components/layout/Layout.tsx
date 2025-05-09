
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavbar from './BottomNavbar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ScrollListener from '../auth/ScrollListener';
import BackButton from '../ui/BackButton';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <LanguageProvider>
      <ThemeProvider>
        <ScrollListener>
          <div className="flex min-h-screen flex-col relative">
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
          </div>
          </ScrollListener>
          <BackButton />
          <BottomNavbar />
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default Layout;
