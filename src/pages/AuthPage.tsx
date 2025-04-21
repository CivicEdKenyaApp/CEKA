
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';

const AuthPage = () => {
  const [isOpen, setIsOpen] = useState(true); // Or false, depending on initial behavior

  return (
    <Layout>
      <div className="flex items-start justify-center min-h-[calc(100vh-16rem)] py-8 px-4 overflow-y-auto">
        <AuthModal open={isOpen} onOpenChange={setIsOpen} />
      </div>
    </Layout>
  );
};

export default AuthPage;
