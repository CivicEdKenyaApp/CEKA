
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="container py-8 md:py-12 h-full">
        <div className="max-w-md mx-auto">
          <AuthModal
            open={true}
            onOpenChange={(open) => {
              if (!open) navigate('/');
            }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default AuthPage;
