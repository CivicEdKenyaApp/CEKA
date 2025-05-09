
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight, Gift, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';

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
  const [showPulse, setShowPulse] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
  
  // Show widget after delay
  useEffect(() => {
    const visibilityTimer = setTimeout(() => {
      setIsVisible(true);
    }, 5000); // 5 seconds
    
    // Start pulse animation after additional delay
    const pulseTimer = setTimeout(() => {
      if (!isExpanded) setShowPulse(true);
    }, 12000); // 12 seconds
    
    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(pulseTimer);
    };
  }, []);
  
  // Stop pulse animation when expanded
  useEffect(() => {
    if (isExpanded) {
      setShowPulse(false);
    }
  }, [isExpanded]);

  const handleMpesa = () => {
    navigator.clipboard.writeText('+254798903373');
    toast({
      title: "M-Pesa number copied",
      description: "+254798903373 copied to clipboard",
      duration: 3000,
    });
  };
  
  const darkMode = theme === 'dark';
  
  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      bottom: "20px", 
      right: "20px" 
    },
    visible: (expanded) => ({ 
      opacity: 1, 
      scale: 1,
      bottom: expanded ? "50%" : "20px",
      right: expanded ? "50%" : "20px",
      x: expanded ? "50%" : 0,
      y: expanded ? "50%" : 0,
      transition: {
        type: "spring",
        stiffness: 380,
        damping: 30,
        mass: 1
      }
    }),
    exit: { 
      opacity: 0, 
      scale: 0.8,
      transition: { duration: 0.3 }
    }
  };

  const pulseAnimation = {
    scale: [1, 1.05, 1],
    transition: {
      duration: 2, 
      repeat: Infinity,
      repeatType: "reverse" as const,
    }
  };

  const dotPulseAnimation = {
    scale: [1, 1.5, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "reverse" as const,
    }
  };

  const heartAnimation = {
    opacity: [0, 1, 0],
    scale: [0.3, 1],
    y: [0, -40],
    transition: {
      duration: 2,
      repeat: Infinity,
      repeatDelay: 3,
      repeatType: "reverse" as const
    }
  };
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          custom={isExpanded}
          className={`fixed z-40 shadow-lg rounded-lg
            ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          {!isExpanded ? (
            // Collapsed state (floating button)
            <motion.button
              className={`flex items-center justify-center p-3 rounded-lg relative
                ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={showPulse ? pulseAnimation : {}}
            >
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-kenya-red rounded-full"
                animate={dotPulseAnimation}
              />
              <div className="relative">
                <Heart className="h-6 w-6 text-kenya-red mr-2" />
                
                {/* Floating hearts animation */}
                <AnimatePresence>
                  {[0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 1, 0],
                        scale: [0.3, 1],
                        y: [0, -40],
                        x: [0, i === 0 ? -10 : i === 2 ? 10 : 0]
                      }}
                      transition={{
                        duration: 2,
                        delay: i * 0.8,
                        repeat: Infinity,
                        repeatDelay: 3
                      }}
                    >
                      <Heart className="h-4 w-4 text-kenya-red fill-kenya-red" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <span className="text-sm font-medium">{translate('Support Us', language)}</span>
            </motion.button>
          ) : (
            // Expanded state (donation options)
            <motion.div 
              className="w-80 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex justify-between items-center mb-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
              >
                <h3 className="font-bold text-lg flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-kenya-green" />
                  {translate('Support Our Work', language)}
                </h3>
                <motion.button
                  className={`rounded-full p-1 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={() => setIsExpanded(false)}
                  whileHover={{ rotate: 45, scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>
              
              <motion.p 
                className="text-sm text-muted-foreground mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
              >
                {translate('Your support helps us continue our mission of civic education in Kenya.', language)}
              </motion.p>
              
              <div className="space-y-3">
                {DONATION_OPTIONS.map((option, index) => (
                  <motion.div 
                    key={option.name}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + index * 0.1, duration: 0.3 }}  
                    className={`p-3 rounded-lg flex items-center justify-between 
                      ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: darkMode ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  >
                    <div className="flex items-center">
                      <motion.div 
                        className="text-xl mr-3"
                        whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.2 } }}
                      >
                        {option.icon}
                      </motion.div>
                      <div>
                        <p className="font-medium text-sm">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{translate(option.description, language)}</p>
                      </div>
                    </div>
                    
                    {option.name === 'M-Pesa' ? (
                      <motion.button
                        onClick={handleMpesa}
                        className={`px-3 py-1 text-sm rounded-md flex items-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: -5 }}
                        >
                          {translate('Copy', language)}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="ml-1"
                        >
                          <Copy className="h-3 w-3" />
                        </motion.span>
                      </motion.button>
                    ) : (
                      <motion.a
                        href={option.url}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className={`px-3 py-1 text-sm rounded-md flex items-center ${darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'}`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: -5 }}
                        >
                          {translate('Visit', language)}
                        </motion.span>
                        <motion.span
                          initial={{ opacity: 0, x: -5 }}
                          whileHover={{ opacity: 1, x: 0 }}
                          className="ml-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </motion.span>
                      </motion.a>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                className={`w-full mt-4 py-2 rounded-md font-medium ${darkMode ? 
                  'bg-kenya-green hover:bg-kenya-green/90 text-white' : 
                  'bg-kenya-green hover:bg-kenya-green/90 text-white'}`}
                onClick={() => setIsExpanded(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
                whileHover={{
                  scale: 1.03,
                  backgroundColor: darkMode ? 'rgba(34, 197, 94, 0.8)' : 'rgba(34, 197, 94, 0.8)'
                }}
                whileTap={{ scale: 0.97 }}
              >
                <motion.div className="relative h-5 overflow-hidden">
                  <motion.div
                    initial={{ y: -2 }}
                    whileHover={{ y: -8 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  >
                    {translate('Maybe Later', language)}
                  </motion.div>
                  <motion.div
                    className="absolute w-full text-center"
                    initial={{ y: 30 }}
                    whileHover={{ y: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    {translate('Thank You', language)}
                  </motion.div>
                </motion.div>
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonationWidget;
