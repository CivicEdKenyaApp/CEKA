
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

export function BackButton() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  
  const [isVisible, setIsVisible] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 80 });
  const [isMobile, setIsMobile] = useState(false);
  
  const isHomePage = location.pathname === '/';

  // Check for mobile and set visibility based on inactivity
  useEffect(() => {
    // Check if the device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Set up inactivity timer
    const timer = setInterval(() => {
      if (Date.now() - lastInteraction > 5000) {
        setIsVisible(false);
      }
    }, 1000);
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    window.addEventListener('mousemove', handleInteraction);
    window.addEventListener('touchstart', handleInteraction);
    
    return () => {
      clearInterval(timer);
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('mousemove', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, [lastInteraction]);

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
    // Calculate new position, constrained to screen
    const newY = Math.min(Math.max(position.y + info.delta.y, 0), window.innerHeight - 80);
    const newX = Math.min(Math.max(position.x + info.delta.x, 0), window.innerWidth - 70);
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    // Short delay to distinguish between drag and click
    setTimeout(() => setIsDragging(false), 100);
  };

  // If we want to hide on desktop, uncomment this
  // if (!isMobile) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-50"
        initial={{ x: position.x, y: position.y, opacity: 1 }}
        animate={{ 
          x: position.x, 
          y: position.y,
          opacity: isVisible ? 1 : 0.1,
          scale: isDragging ? 1.1 : 1 
        }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          opacity: { duration: 0.3 } 
        }}
        drag
        dragConstraints={{
          top: 0,
          left: 0,
          right: window.innerWidth - 70,
          bottom: window.innerHeight - 80,
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={handleInteraction}
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
      >
        <button
          className={cn(
            "p-3 rounded-full shadow-lg bg-primary/90 touch-none",
            "hover:bg-primary/100 transition-colors duration-200",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onClick={() => {
            if (!isDragging) handleBackClick();
          }}
        >
          <ChevronLeft className="h-6 w-6 text-primary-foreground" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default BackButton;
