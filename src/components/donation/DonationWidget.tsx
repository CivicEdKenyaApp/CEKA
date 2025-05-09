import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight, Gift } from 'lucide-react';
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

// Animation variants
const containerVariants = {
  collapsed: {
    opacity: 1,
    right: "20px",
    bottom: "20px",
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 30,
      mass: 1.2
    }
  },
  expanded: {
    opacity: 1,
    right: "50%",
    bottom: "50%",
    x: "50%",
    y: "50%",
    scale: 1,
    rotate: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      mass: 1,
      when: "beforeChildren",
      staggerChildren: 0.07
    }
  },
  exit: {
    opacity: 0, 
    scale: 0.8,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  initial: {
    opacity: 0,
    scale: 0.8, 
    rotate: -10,
    right: "20px",
    bottom: "0px",
    transition: {
      type: "spring"
    }
  }
};

const optionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 15
    }
  }
};

const pulseAnimation = {
  scale: [1, 1.05, 1],
  transition: {
    duration: 2,
    repeat: Infinity,
    repeatType: "reverse"
  }
};

const DonationWidget = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const { language } = useLanguage();
  const { theme } = useTheme();
  
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
    alert('M-Pesa number copied to clipboard: +254798903373');
  };
  
  // Floating heart animation
  const floatingHearts = Array(3).fill(null).map((_, i) => (
    <motion.div
      key={i}
      className="absolute pointer-events-none"
      initial={{ opacity: 0, scale: 0, bottom: "30%", left: "50%" }}
      animate={{ 
        opacity: [0, 1, 0],
        scale: [0.3, 1],
        bottom: ["30%", "80%"],
        left: [`${45 + i * 10}%`, `${40 + i * 20}%`]
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
  ));

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial="initial"
          animate={isExpanded ? "expanded" : "collapsed"}
          exit="exit"
          variants={containerVariants}
          className={`fixed z-40 shadow-lg rounded-lg overflow-hidden
            ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          {!isExpanded ? (
            // Collapsed state (floating button)
            <motion.button
              className={`flex items-center justify-center p-3 rounded-lg relative
                ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} shadow-md`}
              onClick={() => setIsExpanded(true)}
              whileHover={{ scale: 1.1, rotate: 5 }}
              whileTap={{ scale: 0.95 }}
              animate={showPulse ? pulseAnimation : {}}
            >
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-kenya-red rounded-full"
                animate={{ 
                  scale: [1, 1.5, 1],
                  opacity: [0.7, 1, 0.7]
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "reverse"
                }}
              />
              <div className="relative">
                <Heart className="h-6 w-6 text-kenya-red mr-2" />
                {floatingHearts}
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
                transition={{ delay: 0.1 }}
              >
                <h3 className="font-bold text-lg flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-kenya-green" />
                  {translate('Support Our Work', language)}
                </h3>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </motion.div>
              
              <motion.p 
                className="text-sm text-muted-foreground mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                {translate('Your support helps us continue our mission of civic education in Kenya.', language)}
              </motion.p>
              
              <div className="space-y-3">
                {DONATION_OPTIONS.map((option, index) => (
                  <motion.div 
                    key={option.name}
                    variants={optionVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className={`p-3 rounded-lg flex items-center justify-between 
                      ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-50'} transition-colors`}
                    whileHover={{ 
                      scale: 1.03, 
                      boxShadow: theme === 'dark' ? '0 4px 12px rgba(0,0,0,0.3)' : '0 4px 12px rgba(0,0,0,0.1)' 
                    }}
                  >
                    <div className="flex items-center">
                      <motion.div 
                        className="text-xl mr-3"
                        whileHover={{ rotate: [0, -10, 10, -5, 0], transition: { duration: 0.5 } }}
                      >
                        {option.icon}
                      </motion.div>
                      <div>
                        <p className="font-medium text-sm">{option.name}</p>
                        <p className="text-xs text-muted-foreground">{translate(option.description, language)}</p>
                      </div>
                    </div>
                    
                    {option.name === 'M-Pesa' ? (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={handleMpesa}
                        className="relative overflow-hidden group"
                      >
                        <motion.span
                          initial={{ x: 0 }}
                          whileHover={{ x: -30 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          {translate('Copy', language)}
                        </motion.span>
                        <motion.span
                          className="absolute right-2"
                          initial={{ x: 30, opacity: 0 }}
                          whileHover={{ x: 0, opacity: 1 }}
                          transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        >
                          📋
                        </motion.span>
                      </Button>
                    ) : (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="relative overflow-hidden group"
                        asChild
                      >
                        <a href={option.url} target="_blank" rel="noopener noreferrer">
                          <motion.span
                            initial={{ x: 0 }}
                            whileHover={{ x: -20 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            <ArrowRight className="h-4 w-4" />
                          </motion.span>
                          <motion.span
                            className="absolute right-2"
                            initial={{ x: 20, opacity: 0 }}
                            whileHover={{ x: 0, opacity: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                          >
                            →
                          </motion.span>
                        </a>
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, type: "spring" }}
              >
                <Button
                  className="w-full mt-4 bg-kenya-green hover:bg-kenya-green/90 relative overflow-hidden group"
                  onClick={() => setIsExpanded(false)}
                  size="sm"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <motion.span
                    initial={{ y: 0 }}
                    whileHover={{ y: -20 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {translate('Maybe Later', language)}
                  </motion.span>
                  <motion.span
                    className="absolute"
                    initial={{ y: 20, opacity: 0 }}
                    whileHover={{ y: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  >
                    {translate('Thank You', language)}
                  </motion.span>
                </Button>
              </motion.div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonationWidget;
