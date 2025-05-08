
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
        <div className="flex min-h-screen flex-col">
          <ScrollListener>
            <div className="flex flex-col flex-1">
              <Navbar />
              <main className="flex-1 pb-16 md:pb-0">{children}</main>
              <Footer />
              <BottomNavbar />
              <BackButton />
            </div>
          </ScrollListener>
        </div>
      </ThemeProvider>
    </LanguageProvider>
  );
};

export default Layout;
