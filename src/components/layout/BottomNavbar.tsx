
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const BottomNavbar = () => {
  const location = useLocation();
  const { language } = useLanguage();
  
  const navItems = [
    {
      name: 'Home',
      path: '/',
      icon: <Home className="h-5 w-5" />
    },
    {
      name: 'Resources',
      path: '/resources',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Community',
      path: '/community',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: 'Notifications',
      path: '/notifications',
      icon: <Bell className="h-5 w-5" />
    },
    {
      name: 'Profile',
      path: '/profile',
      icon: <User className="h-5 w-5" />
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = 
            location.pathname === item.path || 
            (item.path === '/resources' && location.pathname.includes('/resources'));
            
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary transition-colors"
              )}
            >
              <div className="flex flex-col items-center">
                {item.icon}
                <span className="text-xs mt-1">{translate(item.name, language)}</span>
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavbar;
