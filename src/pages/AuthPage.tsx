import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const navigate = useNavigate();

  // The Dialog component in AuthModal likely uses a portal and positions itself
  // relative to the viewport, not its container in the DOM
  return (
    <Layout>
      {/* We don't need complex positioning containers since the Dialog 
          component likely uses portals and positions itself */}
      <div className="fixed inset-0 flex items-center justify-center z-50">
        <AuthModal
          open={true}
          onOpenChange={() => navigate('/')}
        />
      </div>
    </Layout>
  );
};

export default AuthPage;
