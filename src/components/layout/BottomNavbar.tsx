
<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Upload, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/providers/AuthProvider';
=======
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, FileText, Users, Bell, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
>>>>>>> origin/ceka-app-v5.0.1
import { translate } from '@/lib/utils';

const BottomNavbar = () => {
  const location = useLocation();
  const { language } = useLanguage();
<<<<<<< HEAD
  const { session } = useAuth();
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
=======
>>>>>>> origin/ceka-app-v5.0.1
  
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
<<<<<<< HEAD
      name: 'Upload',
      path: '/resources/upload',
      icon: <Upload className="h-5 w-5" />
    },
    {
      name: 'Blog',
      path: '/blog',
      icon: <Users className="h-5 w-5" />
    },
    {
      name: session ? 'Profile' : 'Sign In',
      path: session ? '/profile/settings' : '/auth',
=======
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
>>>>>>> origin/ceka-app-v5.0.1
      icon: <User className="h-5 w-5" />
    }
  ];

<<<<<<< HEAD
  // Determine icon and text size based on screen width
  const getIconSize = () => {
    if (windowWidth < 360) return "h-4 w-4";
    return "h-5 w-5";
  };
  
  const getTextSize = () => {
    if (windowWidth < 360) return "text-[10px]";
    return "text-xs";
  };

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background border-t shadow-lg w-full max-w-full overflow-x-hidden">
      <nav className="flex justify-between items-center h-16 px-1 sm:px-2">
        {navItems.map((item) => {
          const isActive = 
            location.pathname === item.path || 
            (item.path !== '/' && location.pathname.includes(item.path)) ||
            (item.path === '/profile/settings' && location.pathname.startsWith('/profile'));
=======
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background border-t shadow-lg">
      <nav className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const isActive = 
            location.pathname === item.path || 
            (item.path === '/resources' && location.pathname.includes('/resources'));
>>>>>>> origin/ceka-app-v5.0.1
            
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
<<<<<<< HEAD
                "flex flex-col items-center justify-center flex-1 min-w-0 h-full transition-all duration-300",
=======
                "flex flex-col items-center justify-center w-full h-full",
>>>>>>> origin/ceka-app-v5.0.1
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-primary transition-colors"
              )}
            >
<<<<<<< HEAD
              <div className="flex flex-col items-center px-1">
                {React.cloneElement(item.icon, { className: getIconSize() })}
                <span className={`${getTextSize()} mt-1 truncate w-full text-center`}>
                  {translate(item.name, language)}
                </span>
=======
              <div className="flex flex-col items-center">
                {item.icon}
                <span className="text-xs mt-1">{translate(item.name, language)}</span>
>>>>>>> origin/ceka-app-v5.0.1
              </div>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default BottomNavbar;
