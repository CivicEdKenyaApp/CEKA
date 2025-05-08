import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence, useSpring } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  // App color cycle
  const appColors = ["#e63946", "#2a9d8f", "#212121"]; // Red, Green, Black hex codes
  const [colorIndex, setColorIndex] = useState(0);
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  
  // Home position in the bottom left area
  const homePosition = { x: 20, y: window.innerHeight - 100 };
  const [position, setPosition] = useState(homePosition);
  const [isMobile, setIsMobile] = useState(false);
  
  // Track if button should return home
  const [shouldReturnHome, setShouldReturnHome] = useState(false);
  
  // Animation spring references
  const springX = useSpring(homePosition.x, { stiffness: 300, damping: 20 });
  const springY = useSpring(homePosition.y, { stiffness: 300, damping: 20 });
  
  const isHomePage = location.pathname === '/';

  // Check for mobile and set visibility based on inactivity
  useEffect(() => {
    // Check if the device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Update home position when screen size changes
      const newHomePosition = { x: 20, y: window.innerHeight - 100 };
      springX.set(newHomePosition.x);
      springY.set(newHomePosition.y);
      setPosition(newHomePosition);
    };
    
    // Initial check
    checkMobile();
    
    // Set up inactivity timer
    const timer = setInterval(() => {
      if (Date.now() - lastInteraction > 5000) {
        setIsVisible(false);
      }
    }, 1000);
    
    // Set up color cycling
    const colorTimer = setInterval(() => {
      setColorIndex((prevIndex) => (prevIndex + 1) % appColors.length);
    }, 10000); // Cycle colors every 10 seconds
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      clearInterval(timer);
      clearInterval(colorTimer);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [lastInteraction]);
  
  // Handle spring animation for returning home
  useEffect(() => {
    if (shouldReturnHome) {
      springX.set(homePosition.x);
      springY.set(homePosition.y);
      
      const unsubscribeX = springX.onChange(x => {
        setPosition(pos => ({ ...pos, x }));
      });
      
      const unsubscribeY = springY.onChange(y => {
        setPosition(pos => ({ ...pos, y }));
      });
      
      return () => {
        unsubscribeX();
        unsubscribeY();
      };
    }
  }, [shouldReturnHome, homePosition.x, homePosition.y]);

  const handleInteraction = () => {
    setIsVisible(true);
    setLastInteraction(Date.now());
  };

  const handleBackClick = () => {
    if (isHomePage) {
      const now = Date.now();
      if (now - lastTap < 500) { // Double tap detected (within 500ms)
        // In a real app, this would exit the app
        toast({
          title: translate("Exiting app", language),
          description: translate("App would close now", language),
        });
      } else {
        setLastTap(now);
        toast({
          title: translate("Tap again to exit app", language),
          description: translate("Double tap to close the application", language),
        });
      }
    } else {
      navigate(-1);
    }
  };

  const handleDrag = (event, info) => {
    setIsDragging(true);
    setShouldReturnHome(false);
    
    // Calculate new position, constrained to screen edges
    const newY = Math.min(Math.max(position.y + info.delta.y, 0), window.innerHeight - 80);
    const newX = Math.min(Math.max(position.x + info.delta.x, 0), window.innerWidth - 70);
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    // Check if button is outside bottom-left zone
    const isOutsideHomeZone = 
      position.x > window.innerWidth / 2 || 
      position.y < window.innerHeight / 2;
    
    if (isOutsideHomeZone) {
      // Trigger rubber band return effect
      setShouldReturnHome(true);
      
      // Apply spring physics to animate return
      springX.set(homePosition.x);
      springY.set(homePosition.y);
    }
    
    // Short delay to distinguish between drag and click
    setTimeout(() => setIsDragging(false), 100);
  };

  // If we want to hide on desktop, uncomment this
  // if (!isMobile) return null;

  // Only allow dragging within bottom half of screen
  const dragConstraints = {
    top: window.innerHeight / 2, // Restrict to bottom half
    left: 0,
    right: window.innerWidth / 2, // Restrict to left half
    bottom: window.innerHeight - 80,
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-50"
        initial={{ x: homePosition.x, y: homePosition.y, opacity: 1 }}
        animate={{ 
          x: position.x, 
          y: position.y,
          opacity: isVisible ? 1 : 0.1,
          scale: isDragging ? 1.1 : 1 
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25, 
          opacity: { duration: 0.3 } 
        }}
        drag
        dragConstraints={dragConstraints}
        dragElastic={0.2} // Add elasticity for rubber band effect
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={handleInteraction}
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <button
          style={{ backgroundColor: appColors[colorIndex] }}
          className={cn(
            "p-3 rounded-full shadow-lg touch-none transition-all duration-500",
            "hover:brightness-110 transition-colors duration-200",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onClick={() => {
            if (!isDragging) handleBackClick();
          }}
        >
          <ChevronLeft className="h-6 w-6 text-white" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default BackButton;
