import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, X, ArrowRight, Gift, Copy, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useTheme } from '@/contexts/ThemeContext';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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

// Maximum time to show the donation widget in milliseconds (5 minutes)
const MAX_WIDGET_DISPLAY_TIME = 5 * 60 * 1000;

const DonationWidget = ({ onTimedOut }: { onTimedOut?: () => void }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPulse, setShowPulse] = useState(false);
  const [isIdle, setIsIdle] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);
  const widgetMountTimeRef = useRef<number>(Date.now());
  const { language } = useLanguage();
  const { theme } = useTheme();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  
  // Show widget after delay
  useEffect(() => {
    const visibilityTimer = setTimeout(() => {
      if (!hasTimedOut) setIsVisible(true);
    }, 5000); // 5 seconds
    
    // Start pulse animation after additional delay
    const pulseTimer = setTimeout(() => {
      if (!isExpanded && !hasTimedOut) setShowPulse(true);
    }, 12000); // 12 seconds
    
    // Set idle state after 30 seconds of no interaction
    const idleTimer = setTimeout(() => {
      if (!isExpanded && !isHovering && !hasTimedOut) {
        setIsIdle(true);
      }
    }, 30000); // 30 seconds
    
    // Set timeout timer to hide widget after 5 minutes
    const timeoutTimer = setTimeout(() => {
      if (!isExpanded) { // Only hide if not expanded
        setIsVisible(false);
        setHasTimedOut(true);
        if (onTimedOut) onTimedOut();
      }
    }, MAX_WIDGET_DISPLAY_TIME);
    
    return () => {
      clearTimeout(visibilityTimer);
      clearTimeout(pulseTimer);
      clearTimeout(idleTimer);
      clearTimeout(timeoutTimer);
    };
  }, [isExpanded, isHovering, onTimedOut, hasTimedOut]); // Added hasTimedOut to dependencies
  
  // Stop pulse animation when expanded or hovering
  useEffect(() => {
    if (isExpanded) {
      setShowPulse(false);
      setIsIdle(false);
    }
    
    if (isHovering) {
      setIsIdle(false);
    }
  }, [isExpanded, isHovering]);

  // Calculate remaining time and check if widget should be hidden
  useEffect(() => {
    if (hasTimedOut) return;
    
    const checkRemainingTime = () => {
      const elapsedTime = Date.now() - widgetMountTimeRef.current;
      
      if (elapsedTime >= MAX_WIDGET_DISPLAY_TIME && !isExpanded) {
        setIsVisible(false);
        setHasTimedOut(true);
        if (onTimedOut) onTimedOut();
      }
    };
    
    // Only run interval if widget is meant to be visible or potentially visible
    if (!hasTimedOut && isVisible) { 
        const interval = setInterval(checkRemainingTime, 10000); 
        return () => clearInterval(interval);
    }
    return () => {}; // No-op cleanup if not visible or timed out
  }, [isExpanded, hasTimedOut, onTimedOut, isVisible]);

  const handleMpesa = () => {
    navigator.clipboard.writeText('+254798903373');
    toast({
      title: "M-Pesa number copied",
      description: "+254798903373 copied to clipboard",
      duration: 3000,
    });
  };
  
  const darkMode = theme === 'dark';

  const collapsedPosition = {
    bottom: isMobile ? "80px" : "30%",
    right: "20px"
  };
  
  // Animation variants
  const containerVariants = {
    hidden: { 
      opacity: 0, 
      scale: 0.8,
      ...collapsedPosition // Start from the collapsed position but invisible
    },
    visible: (expanded: boolean) => ({ 
      opacity: expanded ? 1 : (isIdle && !isHovering) ? 0.7 : 1, 
      scale: 1,
      bottom: expanded ? "50%" : collapsedPosition.bottom,
      right: expanded ? "50%" : collapsedPosition.right,
      x: expanded ? "50%" : "0%", // Ensure x is string for framer-motion
      y: expanded ? "50%" : "0%", // Ensure y is string for framer-motion
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
      ...collapsedPosition, // Exit to the collapsed position then fade
      transition: { duration: 0.3 }
    }
  };

  const pulseAnimation = showPulse && !isExpanded ? { // Only pulse if not expanded
    scale: [1, 1.05, 1],
    transition: {
      duration: 2, 
      repeat: Infinity,
      repeatType: "mirror" as const
    }
  } : {};

  const dotPulseAnimation = {
    scale: [1, 1.5, 1],
    opacity: [0.7, 1, 0.7],
    transition: {
      duration: 1.5,
      repeat: Infinity,
      repeatType: "mirror" as const
    }
  };

  // Don't render if timed out
  if (hasTimedOut && !isExpanded) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          custom={isExpanded}
          className={`fixed z-[999] shadow-lg rounded-lg
            ${darkMode ? 'bg-gray-800 border border-gray-700' : 'bg-white border border-gray-200'}`}
        >
          {!isExpanded ? (
            // Collapsed state (floating button)
            <motion.button
              className={`flex items-center justify-center p-3 rounded-lg relative
                ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'} shadow-md`}
              onClick={() => {
                setIsExpanded(true);
                setIsIdle(false); // Ensure not idle when clicked
                setShowPulse(false); // Stop pulse on expand
              }}
              whileHover={{ scale: 1.05, opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              animate={pulseAnimation}
              onMouseEnter={() => {
                setIsHovering(true);
                setIsIdle(false);
              }}
              onMouseLeave={() => {
                setIsHovering(false);
                // Idle timer will take care of setting isIdle
              }}
            >
              <motion.div
                className="absolute -top-1 -right-1 w-3 h-3 bg-kenya-red rounded-full border-2 border-white dark:border-gray-800"
                animate={dotPulseAnimation}
                style={{ display: showPulse && !isExpanded ? 'block' : 'none' }} // Control visibility via style
              />
              <div className="relative">
                <Heart className="h-6 w-6 text-kenya-red mr-2" />
                
                <AnimatePresence>
                  {(!isIdle || isHovering) && [0, 1, 2].map((i) => (
                    <motion.div
                      key={i}
                      className="absolute pointer-events-none"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ 
                        opacity: [0, 0.7, 0], // Adjusted opacity for subtlety
                        scale: [0.3, 0.8], // Adjusted scale
                        y: [0, -30 - (i*5)], // Varied y-offset
                        x: i === 0 ? -8 : i === 2 ? 8 : 0 // Adjusted x-offset
                      }}
                      exit={{ opacity: 0, scale: 0}} // Ensure exit animation
                      transition={{
                        duration: 1.5 + (i*0.2), // Varied duration
                        delay: i * 0.6,
                        repeat: Infinity,
                        repeatDelay: 2.5, // Adjusted repeat delay
                        ease: "easeInOut"
                      }}
                    >
                      <Heart className="h-3 w-3 text-kenya-red fill-kenya-red" />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
              <span className="text-sm font-medium">{translate('Support Us', language)}</span>
            </motion.button>
          ) : (
            // Expanded state (donation options)
            <motion.div 
              className="w-full max-w-sm sm:w-80 p-4" // Responsive width
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex justify-between items-center mb-3"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }} // Slightly faster entry for header
              >
                <h3 className="font-bold text-lg flex items-center">
                  <Gift className="h-5 w-5 mr-2 text-kenya-green" />
                  {translate('Support Our Work', language)}
                </h3>
                <motion.button
                  aria-label="Close donation widget"
                  className={`rounded-full p-1 ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}
                  onClick={() => {
                    setIsExpanded(false);
                    // Check if it should become invisible due to timeout after closing
                    if(hasTimedOut) setIsVisible(false);
                  }}
                  whileHover={{ rotate: 90, scale: 1.1 }} // Rotate more for clear action
                  whileTap={{ scale: 0.9 }}
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </motion.div>
              
              <motion.p 
                className="text-sm text-muted-foreground mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.15, duration: 0.3 }}
              >
                {translate('Your support helps us continue our mission of civic education in Kenya.', language)}
              </motion.p>
              
              <div className="space-y-3">
                {DONATION_OPTIONS.map((option, index) => (
                  <motion.div 
                    key={option.name}
                    initial={{ opacity: 0, x: -20 }} // Slide in from left
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.07, duration: 0.3 }}  // Staggered animation
                    className={`p-3 rounded-lg flex items-center justify-between 
                      ${darkMode ? 'hover:bg-gray-700 focus-within:bg-gray-700' : 'hover:bg-gray-50 focus-within:bg-gray-50'} transition-colors`}
                    whileHover={{ 
                      scale: 1.02, 
                      boxShadow: darkMode ? '0 2px 8px rgba(0,0,0,0.4)' : '0 2px 8px rgba(0,0,0,0.1)' 
                    }}
                  >
                    <div className="flex items-center">
                      <motion.div 
                        className="text-xl mr-3"
                        whileHover={{ rotate: [-5, 5, -5, 5, 0], scale: 1.1, transition: { duration: 0.3 } }}
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
                        className="flex items-center text-xs"
                        aria-label={`Copy M-Pesa number for ${option.name}`}
                      >
                        {translate('Copy', language)}
                        <Copy className="ml-1.5 h-3 w-3" />
                      </Button>
                    ) : (
                      <Button
                        asChild
                        size="sm"
                        variant="outline"
                        className="flex items-center text-xs"
                        aria-label={`Visit ${option.name} donation page`}
                      >
                        <a
                          href={option.url}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          {translate('Visit', language)}
                          <ExternalLink className="ml-1.5 h-3 w-3" />
                        </a>
                      </Button>
                    )}
                  </motion.div>
                ))}
              </div>
              
              <motion.button
                className={`w-full mt-5 py-2.5 rounded-md font-medium text-sm ${darkMode ? 
                  'bg-kenya-green hover:bg-kenya-green/90 text-white' : 
                  'bg-kenya-green hover:bg-kenya-green/90 text-white'}`}
                onClick={() => {
                  setIsExpanded(false);
                  if(hasTimedOut) setIsVisible(false);
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + DONATION_OPTIONS.length * 0.07, duration: 0.3 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {translate('Maybe Later', language)}
              </motion.button>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DonationWidget;
