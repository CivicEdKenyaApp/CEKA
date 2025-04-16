
import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

const LoadingScreen = () => {
  const { language } = useLanguage();
  
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-lg font-medium">{translate("Loading...", language)}</p>
    </div>
  );
};

export default LoadingScreen;
