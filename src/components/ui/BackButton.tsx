
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
  
  // State variables
  const [isVisible, setIsVisible] = useState(true);
  const [lastInteraction, setLastInteraction] = useState(Date.now());
  const [lastTap, setLastTap] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [colorProgress, setColorProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartPos, setDragStartPos] = useState({ x: 0, y: 0 });
  
  // Constants
  const isHomePage = location.pathname === '/';
  
  // Kenyan flag colors
  const kenyaColors = {
    green: "#006600",
    black: "#141414",
    red: "#BB1600",
    white: "#EEEEEE"
  };
  
  // Event Handlers
  const handleInteraction = () => {
    setIsVisible(true);
    setLastInteraction(Date.now());
  };
  
  const handleBackClick = (e) => {
    // Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();
    
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
  
  const handleDragStart = (event, info) => {
    setIsDragging(true);
    setDragStartPos({ x: info.point.x, y: info.point.y });
  };
  
  const handleDragEnd = (event, info) => {
    // Calculate distance dragged
    const distance = Math.sqrt(
      Math.pow(info.point.x - dragStartPos.x, 2) + 
      Math.pow(info.point.y - dragStartPos.y, 2)
    );
    
    // If dragged less than 5px, consider it a click
    if (distance < 5) {
      handleBackClick(event);
    }
    
    // Reset drag state after a short delay
    setTimeout(() => {
      setIsDragging(false);
    }, 50);
  };
  
  // Color Calculation Functions
  const getCurrentColor = (progress) => {
    // Create a cycle through: green -> black -> red -> white -> green
    const cycle = 4; // 4 colors
    const normalizedProgress = (progress % 100) / 100 * cycle;
    const colorIndex = Math.floor(normalizedProgress);
    const remainder = normalizedProgress - colorIndex;
    
    // Determine which colors to blend between
    let color1, color2;
    switch (colorIndex) {
      case 0:
        color1 = kenyaColors.green;
        color2 = kenyaColors.black;
        break;
      case 1:
        color1 = kenyaColors.black;
        color2 = kenyaColors.red;
        break;
      case 2:
        color1 = kenyaColors.red;
        color2 = kenyaColors.white;
        break;
      case 3:
        color1 = kenyaColors.white;
        color2 = kenyaColors.green;
        break;
      default:
        color1 = kenyaColors.green;
        color2 = kenyaColors.black;
    }
    
    return blendColors(color1, color2, remainder);
  };
  
  const blendColors = (color1, color2, ratio) => {
    // Parse hex colors to RGB
    const r1 = parseInt(color1.substring(1, 3), 16);
    const g1 = parseInt(color1.substring(3, 5), 16);
    const b1 = parseInt(color1.substring(5, 7), 16);
    
    const r2 = parseInt(color2.substring(1, 3), 16);
    const g2 = parseInt(color2.substring(3, 5), 16);
    const b2 = parseInt(color2.substring(5, 7), 16);
    
    // Blend the colors
    const r = Math.round(r1 + (r2 - r1) * ratio);
    const g = Math.round(g1 + (g2 - g1) * ratio);
    const b = Math.round(b1 + (b2 - b1) * ratio);
    
    // Convert back to hex
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  };

  // Effects
  useEffect(() => {
    // Check if the device is mobile based on screen width
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    // Initial check
    checkMobile();
    
    // Set up timers
    const visibilityTimer = setInterval(() => {
      if (Date.now() - lastInteraction > 5000) {
        setIsVisible(false);
      }
    }, 1000);
    
    const colorTimer = setInterval(() => {
      setColorProgress(prev => (prev + 0.1) % 100); // Very slow progression
    }, 100); // Update every 100ms for smooth animation
    
    // Add event listeners
    window.addEventListener('resize', checkMobile);
    
    // Cleanup
    return () => {
      clearInterval(visibilityTimer);
      clearInterval(colorTimer);
      window.removeEventListener('resize', checkMobile);
    };
  }, [lastInteraction]);

  // Render
  return (
    <AnimatePresence>
      <motion.button
        className={cn(
          "fixed bottom-24 left-4 z-50 p-3 rounded-full shadow-lg",
          "transition-colors duration-200",
          "touch-none cursor-pointer"
        )}
        style={{ 
          backgroundColor: getCurrentColor(colorProgress),
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)"
        }}
        initial={{ opacity: 1 }}
        animate={{ opacity: isVisible ? 1 : 0.1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onMouseEnter={handleInteraction}
        onMouseMove={handleInteraction}
        onTouchStart={handleInteraction}
        drag
        dragConstraints={{
          top: window.innerHeight / 2, // Restrict to bottom half
          right: window.innerWidth / 2, // Restrict to left half
          bottom: 20,
          left: 0
        }}
        dragElastic={0.1} // Light elasticity
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <ChevronLeft className="h-6 w-6 text-white" />
      </motion.button>
    </AnimatePresence>
  );
}

export default BackButton;
