import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const navigate = useNavigate();

  return (
    <Layout>
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="w-full max-w-md">
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
