
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import AuthModal from '@/components/auth/AuthModal';
import { useTheme } from '@/contexts/ThemeContext';

const AuthPage = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();

  return (
    <div className={`container py-8 md:py-12 h-full ${theme === 'dark' ? 'bg-background text-foreground' : ''}`}>
      <div className="max-w-md mx-auto">
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
