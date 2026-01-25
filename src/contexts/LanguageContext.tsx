
import React, { createContext, useContext, useEffect, useState } from 'react';

// Define available languages
<<<<<<< HEAD
export type Language = 'en' | 'sw' | 'ksl' | 'br';
=======
export type Language = 'en' | 'sw';
>>>>>>> origin/ceka-app-v5.0.1

// Define the context shape
type LanguageContextType = {
  language: Language;
  setLanguage: (lang: Language) => void;
};

// Create context with default values
const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
});

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language');
<<<<<<< HEAD
    return (savedLanguage === 'en' || savedLanguage === 'sw' || savedLanguage === 'ksl' || savedLanguage === 'br') 
      ? savedLanguage as Language 
      : 'en';
=======
    return (savedLanguage === 'en' || savedLanguage === 'sw') ? savedLanguage : 'en';
>>>>>>> origin/ceka-app-v5.0.1
  });

  // Update language and save to localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  // Update document language attribute
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};
