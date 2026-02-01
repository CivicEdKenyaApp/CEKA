import React, { useState } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import BottomNavbar from './BottomNavbar';
import DonationWidget from '@/components/DonationWidget';

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

  return (
    <div className="flex min-h-screen flex-col relative overflow-x-hidden">
      <Navbar />
      <main className="flex-1 pt-16 lg:pt-0 pb-16 lg:pb-0 w-full overflow-x-hidden">{children}</main>
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
