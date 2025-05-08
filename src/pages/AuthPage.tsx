
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [authPageActive, setAuthPageActive] = useState(false);

  // Function to handle setting the AuthPage session when accessing it
  useEffect(() => {
    if (location.pathname === '/auth') {
      setAuthPageActive(true);  // Mark as active when the user navigates to AuthPage
    }
  }, [location.pathname]);

  // Handle Modal Close logic, allowing for specific exit conditions
  const handleModalClose = (open: boolean) => {
    // Only navigate away if not active on auth page or explicitly closing
    if (!open && authPageActive) {
      navigate('/auth');
    }
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12 h-full">
        <div className="max-w-md mx-auto">
          <AuthModal open={true} onOpenChange={handleModalClose} />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
