import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

interface LogoProps {
  variant?: 'full' | 'icon-only' | 'text-only';
  className?: string;
}

const Logo = ({ variant = 'full', className }: LogoProps) => {
  const { theme } = useTheme();

  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      {(variant === 'full' || variant === 'icon-only') && (
        <div className="w-8 h-8 flex items-center justify-center relative">
          <motion.img 
            src="/logo-colored.png"
            alt="CEKA Logo Light" 
            className="h-8 w-8 object-contain absolute"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: theme === 'light' ? 1 : 0,
              scale: theme === 'light' ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
          />
          <motion.img 
            src="/logo-white.png"
            alt="CEKA Logo Dark" 
            className="h-8 w-8 object-contain absolute"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ 
              opacity: theme === 'dark' ? 1 : 0,
              scale: theme === 'dark' ? 1 : 0.8
            }}
            transition={{ duration: 0.3 }}
          />
        </div>
      )}
      
      {(variant === 'full' || variant === 'text-only') && (
        <div className="flex flex-col">
          <span className="font-bold text-kenya-green dark:text-white">CEKA</span>
        </div>
      )}
    </Link>
  );
};

export default Logo;
