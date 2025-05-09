
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';

const DONATION_OPTIONS = [
  {
    name: 'Ko-fi',
    url: 'https://ko-fi.com/civiceducationkenya',
    description: 'Support us with a coffee',
    icon: '☕'
  },
  {
    name: 'PayPal',
    url: 'https://paypal.me/civiceducationkenya',
    description: 'Donate via PayPal',
    icon: '💳'
  },
  {
    name: 'M-Pesa',
    number: '+254798903373',
    description: 'Send to M-Pesa',
    icon: '📱'
  }
];

const DonationWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();

  // Show widget after 60 seconds on the site
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 60000); // 60 seconds
    
    return () => clearTimeout(timer);
  }, []);

  const handleMpesa = () => {
    // Copy number to clipboard
    navigator.clipboard.writeText('+254798903373');
    alert('M-Pesa number copied to clipboard: +254798903373');
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ bottom: "-100%", opacity: 0 }}
          animate={{ 
            bottom: isExpanded ? "50%" : "20px", 
            opacity: 1,
            y: isExpanded ? "-50%" : 0,
            x: isExpanded ? "-50%" : 0
          }}
          exit={{ bottom: "-100%", opacity: 0 }}
          transition={{ type: "spring", stiffness: 100, damping: 20 }}
          className={`fixed ${isExpanded ? 'left: 50%' : 'right: 20px'} z-40 shadow-lg rounded-lg
            ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          {!isExpanded ? (
            // Collapsed state (floating button)
            <motion.button
              className={`flex items-center justify-center p-3 rounded-full 
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-lg`}
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Heart className="h-6 w-6 text-kenya-red mr-2" />
              <span className="text-sm font-medium">{translate('Support Us', language)}</span>
            </motion.button>
          ) : (
            // Expanded state (donation options)
            <div className="w-[300px] p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold text-lg">{translate('Support Our Work', language)}</h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4">
                {translate('Your support helps us continue our mission of civic education in Kenya.', language)}
              </p>
              
              <div className="space-y-3">
                {DONATION_OPTIONS.map((option) => (
                  <div 
                    key={option.name}
                    className={`p-3 rounded-lg flex items-center justify-between 
                      ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                  >
                    <div className="flex items-center">
                      <div className="text-xl mr-3">{option.icon}</div>
                      <div>
                        <p className="font-medium text-sm">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{translate(option.description, language)}</p>
                      </div>
                    </div>
                    
                    {option.name === 'M-Pesa' ? (
                      <Button size="sm" variant="outline" onClick={handleMpesa}>
                        {translate('Copy', language)}
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" asChild>
                        <a href={option.url} target="_blank" rel="noopener noreferrer">
                          <ArrowRight className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                ))}
              </div>
              
              <Button
                className="w-full mt-4 bg-kenya-green hover:bg-kenya-green/90"
                onClick={() => setIsExpanded(false)}
                size="sm"
              >
                {translate('Maybe Later', language)}
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonationWidget;
