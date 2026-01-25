
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
<<<<<<< HEAD
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import BottomNavbar from './BottomNavbar';
import DonationWidget from '@/components/DonationWidget';
=======
import BottomNavbar from './BottomNavbar';
import { LanguageProvider } from '@/contexts/LanguageContext';
import ScrollListener from '../auth/ScrollListener';
>>>>>>> origin/ceka-app-v5.0.1

interface LayoutProps {
  children: React.ReactNode;
  hideBottomNav?: boolean;
  hideBackButton?: boolean;
}

const Layout = ({ children, hideBottomNav, hideBackButton }: LayoutProps) => {
  // State to track if the donation widget has timed out
  const [donationTimedOut, setDonationTimedOut] = useState(false);
  // State to track if the donation widget is expanded
  const [showDonationWidget, setShowDonationWidget] = useState(false);
  
  // Handle donation widget timeout
  const handleDonationTimeout = () => {
    setDonationTimedOut(true);
  };
  
  // Handle support us click from navbar
  const handleSupportUsClick = () => {
    setShowDonationWidget(true);
  };
  
  return (
<<<<<<< HEAD
    <div className="flex min-h-screen flex-col relative overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pb-16 md:pb-0 w-full overflow-x-hidden">{children}</main>
      <Footer />
      {!hideBottomNav && <BottomNavbar />}
      
      {/* Conditionally render the donation widget */}
      {(showDonationWidget || !donationTimedOut) && (
        <DonationWidget 
          onTimedOut={handleDonationTimeout} 
        />
      )}
    </div>
=======
    <LanguageProvider>
      <ScrollListener>
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1 pb-16 md:pb-0">{children}</main>
          <Footer />
          <BottomNavbar />
        </div>
      </ScrollListener>
    </LanguageProvider>
>>>>>>> origin/ceka-app-v5.0.1
  );
};

export default Layout;
