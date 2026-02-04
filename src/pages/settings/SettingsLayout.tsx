
import React from 'react';
import { Outlet, useNavigate, Link, useLocation } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { motion } from 'framer-motion';
import { User, Bell, Shield, Eye, Settings as SettingsIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

const SettingsLayout = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const currentPath = location.pathname.split('/').pop() || 'account';

  const tabs = [
    { id: 'account', label: translate("Account", language), icon: User, path: '/settings/account', adminOnly: false, authRequired: true },
    { id: 'notifications', label: translate("Notifications", language), icon: Bell, path: '/settings/notifications', adminOnly: false, authRequired: false },
    { id: 'appearance', label: translate("Appearance", language), icon: Eye, path: '/settings/appearance', adminOnly: false, authRequired: false },
    { id: 'privacy', label: translate("Privacy", language), icon: Shield, path: '/settings/privacy', adminOnly: false, authRequired: false },
  ];

  React.useEffect(() => {
    if (!user && currentPath === 'account') {
      navigate('/settings/notifications', { replace: true });
    }
  }, [user, currentPath, navigate]);

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/50 dark:bg-slate-950/20 pt-12 pb-24">
        <div className="container max-w-5xl space-y-12">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4 md:px-0">
            <div className="space-y-2">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-primary font-bold uppercase tracking-[0.2em] text-[10px]"
              >
                <SettingsIcon className="h-4 w-4" />
                {translate("System Preferences", language)}
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                {translate("Settings", language)}
              </h1>
              <p className="text-slate-500 max-w-sm">
                {translate("Manage your account and preferences", language)}
              </p>
            </div>
          </div>

          {/* Horizontal Premium Nav Bar */}
          <div className="sticky top-20 z-40 px-4 md:px-0">
            <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-2xl border border-white/20 dark:border-white/5 rounded-3xl shadow-ios-high p-1.5 flex flex-nowrap overflow-x-auto no-scrollbar gap-1">
              {tabs.map((tab) => {
                const isActive = currentPath === tab.id;
                if (tab.authRequired && !user) return null;

                return (
                  <Link
                    key={tab.id}
                    to={tab.path}
                    className={cn(
                      "relative flex items-center justify-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 whitespace-nowrap group",
                      isActive ? "text-white" : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    {isActive && (
                      <motion.div
                        layoutId="activeTab"
                        className="absolute inset-0 bg-gradient-to-r from-kenya-red to-kenya-red/80 shadow-lg shadow-kenya-red/20 rounded-2xl"
                        transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                      />
                    )}
                    <tab.icon className={cn("h-4 w-4 relative z-10 transition-transform group-hover:scale-110", isActive && "text-white")} />
                    <span className="text-sm font-bold relative z-10 uppercase tracking-wider">{tab.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Sub-page Content Container */}
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="px-4 md:px-0"
          >
            <Outlet />
          </motion.div>
        </div>
      </div>
    </Layout>
  );
};

export default SettingsLayout;
