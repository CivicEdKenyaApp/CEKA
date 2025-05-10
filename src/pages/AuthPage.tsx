
import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthModal from '@/components/auth/AuthModal';
import { useTheme } from '@/contexts/ThemeContext';
import ScrollToTop from '@/components/ScrollToTop';

const AuthPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  
  return (
    <div className={`min-h-screen flex items-center justify-center py-8 md:py-12 px-4 ${
      theme === 'dark' ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-900'
    }`}>
      <ScrollToTop />
      <div className="max-w-md w-full">
        <AuthModal
          open={true}
          onOpenChange={(open) => {
            if (!open) navigate('/');
          }}
        />
      </div>
    </div>
  );
};

export default AuthPage;
