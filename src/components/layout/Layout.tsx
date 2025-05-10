
import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import ScrollListener from '../auth/ScrollListener';
import DonationWidget from '../donation/DonationWidget';
import BottomNavbar from '../layout/BottomNavbar';

interface LayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideBackButton?: boolean;
}

const Layout = ({ children, hideBottomNav, hideBackButton }: LayoutProps) => {
  return (
    <div className="flex min-h-screen flex-col relative">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      <DonationWidget />
      <BottomNavbar/>
    </div>
  );
};

export default Layout;
