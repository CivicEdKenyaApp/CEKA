
import React from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface LogoProps {
  variant?: 'full' | 'icon-only' | 'text-only';
  className?: string;
}

const Logo = ({ variant = 'full', className }: LogoProps) => {
  return (
    <Link to="/" className={cn("flex items-center space-x-2", className)}>
      <div className="w-8 h-8 bg-kenya-green rounded-md flex items-center justify-center">
        <span className="text-white font-bold text-sm">CE</span>
      </div>
      <span className="font-bold text-xl">CEKA</span>
    </Link>
  );
};

export default Logo;
