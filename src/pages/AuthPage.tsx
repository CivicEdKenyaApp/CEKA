
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Disable auto-close logic inside the modal by overriding onOpenChange
  const handleModalClose = () => {
    // If user manually dismisses modal on this route, navigate away
    if (location.pathname === '/auth') {
      navigate('/');
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
