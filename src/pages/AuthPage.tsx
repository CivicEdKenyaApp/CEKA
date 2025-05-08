import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container py-8 md:py-12 min-h-screen flex items-center justify-center">
        <div className="w-full max-w-md mx-auto">
          <AuthModal
            open={true}
            onOpenChange={() => navigate('/')}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
