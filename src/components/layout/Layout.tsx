
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
  hideBottomNav?: boolean;
  hideBackButton?: boolean;
}

const Layout = ({ children, hideBottomNav = false, hideBackButton = false }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col relative">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      {!hideBackButton && <BackButton />}
      {!hideBottomNav && <BottomNavbar />}
      <Footer />
    </div>
  );
};

export default Layout;
