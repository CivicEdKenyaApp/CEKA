
import React, { useState, useEffect, useRef } from 'react';
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
  const [lastTap, setLastTap] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [colorProgress, setColorProgress] = useState(0);
  
  const isHomePage = location.pathname === '/';
  
  // Kenyan flag colors
  const kenyaColors = {
    green: "#006600",
    black: "#141414",
    red: "#BB1600",
    white: "#EEEEEE"
  };
  
  // Calculate smooth color transition
  const getCurrentColor = () => {
    // Create an array of colors to transition between
    const colors = [kenyaColors.green, kenyaColors.black, kenyaColors.red, kenyaColors.white];
    const totalSegments = colors.length;
    const segmentSize = 1 / totalSegments;
    
    // Determine which segment of the transition we're in
    const segmentIndex = Math.floor(colorProgress * totalSegments) % totalSegments;
    const nextSegmentIndex = (segmentIndex + 1) % totalSegments;
    
    // Calculate how far we are through the current segment (0-1)
    const segmentProgress = (colorProgress * totalSegments) % 1;
    
    // Get the two colors we're transitioning between
    const color1 = colors[segmentIndex];
    const color2 = colors[nextSegmentIndex];
    
    // Helper function to interpolate between two hex color values
    const interpolateColor = (color1, color2, factor) => {
      // Convert hex to RGB
      const r1 = parseInt(color1.substring(1, 3), 16);
      const g1 = parseInt(color1.substring(3, 5), 16);
      const b1 = parseInt(color1.substring(5, 7), 16);
      
      const r2 = parseInt(color2.substring(1, 3), 16);
      const g2 = parseInt(color2.substring(3, 5), 16);
      const b2 = parseInt(color2.substring(5, 7), 16);
      
      // Interpolate RGB values
      const r = Math.round(r1 + (r2 - r1) * factor);
      const g = Math.round(g1 + (g2 - g1) * factor);
      const b = Math.round(b1 + (b2 - b1) * factor);
      
      // Convert back to hex
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    };
    
    // Return the interpolated color
    return interpolateColor(color1, color2, segmentProgress);
  };
  
  // Check for mobile and manage visibility/color cycling
  useEffect(() => {
    // Check if the device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Set up inactivity timer
    const visibilityTimer = setInterval(() => {
      if (Date.now() - lastInteraction > 5000) {
        setIsVisible(false);
      }
    }, 1000);
    
    // Set up slow color cycling (full cycle takes 2 minutes)
    const colorTimer = setInterval(() => {
      setColorProgress(prev => (prev + 0.0005) % 1);
    }, 100);
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    
    return () => {
      clearInterval(visibilityTimer);
      clearInterval(colorTimer);
      window.removeEventListener('resize', checkMobile);
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
  
  // Only render on mobile devices
  if (!isMobile) return null;
  
  return (
    <AnimatePresence>
      <motion.button
        className={cn(
          "fixed bottom-24 left-4 z-100 p-3 w-12 h-12 rounded-full shadow-lg",
          "transition-colors duration-200",
          "touch-none cursor-pointer"
        )}
        style={{
          backgroundColor: getCurrentColor()
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isVisible ? 1 : 0.1 }}
        transition={{ duration: 0.3 }}
        onMouseEnter={handleInteraction}
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        onClick={handleBackClick}
        drag
        dragConstraints={{
          top: 0,
          right: 20,
          bottom: 20,
          left: 0
        }}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </motion.button>
    </AnimatePresence>
  );
}

export default BackButton;
