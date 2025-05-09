
import React from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Link, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useAuth } from '@/App';

const SettingsLayout = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentPath = location.pathname.split('/').pop() || 'account';
  
  React.useEffect(() => {
    // If user is not logged in and tries to access account settings, redirect to notifications
    if (!user && currentPath === 'account') {
      navigate('/settings/notifications', { replace: true });
    }
  }, [user, currentPath, navigate]);
  
  return (
    <Layout>
      <div className="container py-6 md:py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2">{translate("Settings", language)}</h1>
          <p className="text-muted-foreground">{translate("Manage your account and preferences", language)}</p>
        </div>
        
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-64 shrink-0">
            <div className="sticky top-20 space-y-1">
              {user && (
                <Link
                  to="/settings/account"
                  className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                    currentPath === 'account' ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'
                  }`}
                >
                  {translate("Account", language)}
                </Link>
              )}
              <Link
                to="/settings/notifications"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  currentPath === 'notifications' ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'
                }`}
              >
                {translate("Notifications", language)}
              </Link>
              <Link
                to="/settings/privacy"
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  currentPath === 'privacy' ? 'bg-accent text-accent-foreground font-medium' : 'hover:bg-muted'
                }`}
              >
                {translate("Privacy", language)}
              </Link>
            </div>
          </div>
          <div className="flex-1 max-w-3xl">
            <Outlet />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsLayout;
