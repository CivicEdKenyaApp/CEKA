
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/App';
import AuthModal from './AuthModal';
import { motion, AnimatePresence } from 'framer-motion';

interface ScrollListenerProps {
  children: React.ReactNode;
}

const ScrollListener = ({ children }: ScrollListenerProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const { session, loading } = useAuth();
  
  useEffect(() => {
    if (loading) return;
    
    // If user is not logged in, set up scroll listener
    if (!session) {
      const handleScroll = () => {
        // Show auth modal after scrolling down 150px
        if (window.scrollY > 150 && !showAuth) {
          setIsBlurred(true);
          setTimeout(() => setShowAuth(true), 300); // Delay modal appearance for blur effect
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      // If logged in, ensure no blur
      setIsBlurred(false);
    }
  }, [session, showAuth, loading]);
  
  // Reset blur when auth modal is closed
  const handleAuthModalClose = (open: boolean) => {
    setShowAuth(open);
    if (!open && !session) {
      // Small delay before removing blur when closing modal
      setTimeout(() => setIsBlurred(false), 300);
    }
  };

  // Define gradient background for blurred state
  const blurStyles = isBlurred && !session 
    ? 'blur-sm after:absolute after:inset-0 after:bg-gradient-to-tr after:from-[#006600]/20 after:via-[#141414]/15 after:to-[#BB1600]/20 after:z-[-1]' 
    : '';
  
  return (
    <>
      <motion.div 
        className={`relative transition-all duration-300 ${blurStyles}`}
        animate={{ 
          filter: isBlurred && !session ? 'blur(8px)' : 'blur(0px)'
        }}
        transition={{ duration: 0.5 }}
      >
        {children}
      </motion.div>
      <AuthModal 
        open={showAuth} 
        onOpenChange={handleAuthModalClose} 
      />
    </>
  );
};

export default ScrollListener;
