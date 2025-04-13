
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavbar from './BottomNavbar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ScrollListener from '../auth/ScrollListener';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <LanguageProvider>
      <div className="flex min-h-screen flex-col">
        <ScrollListener>
          <>
            <Navbar />
            <main className="flex-1 pb-16 md:pb-0">{children}</main>
            <Footer />
            <BottomNavbar />
          </>
        </ScrollListener>
      </div>
    </LanguageProvider>
  );
};

export default Layout;
