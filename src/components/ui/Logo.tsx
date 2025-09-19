import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon-only' | 'text-only';
  className?: string;
}

const Logo = ({ variant = 'full', className }: LogoProps) => {
  const { theme } = useTheme();

  const logoVariants = {
    light: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6
      }
    },
    dark: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.6
      }
    }
  };

  const logoVariantsDark = {
    light: {
      opacity: 0,
      scale: 0.95,
      transition: {
        duration: 0.6
      }
    },
    dark: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.6
      }
    }
  };

  return (
    <Link to="/" className={cn("flex items-center gap-2", className)}>
      {(variant === 'full' || variant === 'icon-only') && (
        <div className="relative h-8 w-8">
          <motion.img 
            src="/logo-colored.png"
            alt="CEKA Logo Light"
            className="h-8 w-8 object-contain absolute"
            variants={logoVariants}
            initial="light"
            animate={theme === 'light' ? 'light' : 'dark'}
          />
          <motion.img 
            src="/logo-white.png"
            alt="CEKA Logo Dark"
            className="h-8 w-8 object-contain absolute"
            variants={logoVariantsDark}
            initial="light"
            animate={theme === 'light' ? 'light' : 'dark'}
          />
        </div>
      )}
      
      {(variant === 'full' || variant === 'text-only') && (
        <span className="font-bold text-foreground">CEKA</span>
      )}
    </Link>
  );
};

export default Logo;
