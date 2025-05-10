
import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import BottomNavbar from './BottomNavbar';
import DonationWidget from '../donation/DonationWidget';

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
    <div className="flex min-h-screen flex-col relative">
      <Navbar 
        supportUsVisible={donationTimedOut} 
        onSupportUsClick={handleSupportUsClick}
        showProfileIcon={true} // Always show profile icon on desktop
      />
      <main className="flex-1 pb-16 md:pb-0">{children}</main>
      <Footer />
      {!hideBottomNav && <BottomNavbar />}
      
      {/* Conditionally render the donation widget */}
      {(showDonationWidget || !donationTimedOut) && (
        <DonationWidget 
          onTimedOut={handleDonationTimeout} 
        />
      )}
    </div>
  );
};

export default Layout;
