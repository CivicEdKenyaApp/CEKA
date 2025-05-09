
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

export const BackButton = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { language } = useLanguage();
  const [opacity, setOpacity] = useState(1);
  const [position, setPosition] = useState({ x: 20, y: window.innerHeight - 80 });
  const [isDragging, setIsDragging] = useState(false);
  const [lastTap, setLastTap] = useState(0);
  const isHomePage = location.pathname === '/';

  // Handle opacity change after inactivity
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const resetTimeout = () => {
      clearTimeout(timeout);
      setOpacity(1);
      timeout = setTimeout(() => setOpacity(0.1), 5000);
    };
    
    resetTimeout();
    
    window.addEventListener('mousemove', resetTimeout);
    window.addEventListener('touchstart', resetTimeout);
    
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('mousemove', resetTimeout);
      window.removeEventListener('touchstart', resetTimeout);
    };
  }, []);

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

  const handleDrag = (event: any, info: any) => {
    setIsDragging(true);
    
    // Calculate new position, constrained to bottom half of screen
    const newY = Math.min(Math.max(position.y + info.delta.y, window.innerHeight / 2), window.innerHeight - 80);
    const newX = Math.min(Math.max(position.x + info.delta.x, 20), window.innerWidth - 70);
    
    setPosition({ x: newX, y: newY });
  };

  const handleDragEnd = () => {
    // Short delay to distinguish between drag and click
    setTimeout(() => setIsDragging(false), 100);
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed z-50"
        initial={{ x: position.x, y: position.y, opacity: 1 }}
        animate={{ 
          x: position.x, 
          y: position.y,
          opacity: opacity,
          scale: isDragging ? 1.1 : 1
        }}
        transition={{ 
          type: "spring", 
          damping: 20, 
          opacity: { duration: 0.5 } 
        }}
        drag
        dragConstraints={{
          top: window.innerHeight / 2,
          left: 20,
          right: window.innerWidth - 70,
          bottom: window.innerHeight - 80,
        }}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button 
          variant="secondary"
          size="icon"
          className={cn(
            "rounded-full shadow-lg bg-background/80 backdrop-blur hover:bg-background w-12 h-12",
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          onClick={() => {
            if (!isDragging) handleBackClick();
          }}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default BackButton;
