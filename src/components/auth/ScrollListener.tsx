
import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '@/App';
import { useToast } from '@/components/ui/use-toast';

interface ScrollListenerProps {
  children: React.ReactNode;
}

const ScrollListener: React.FC<ScrollListenerProps> = ({ children }) => {
  const { session } = useAuth();
  const location = useLocation();
  const { toast } = useToast();
  const hasScrolled = useRef(false);
  const hasInteracted = useRef(false);
  const hasShownToast = useRef(false);

  useEffect(() => {
    // Reset on route change
    hasScrolled.current = false;
    hasShownToast.current = false;
    
    // Check session storage for interaction state
    const interacted = sessionStorage.getItem('userInteracted');
    if (interacted === 'true') {
      hasInteracted.current = true;
    }
    
    const handleScroll = () => {
      // Only trigger if not already scrolled, not already interacted, no session, and not on auth page
      if (!hasScrolled.current && !hasInteracted.current && !session && location.pathname !== '/auth') {
        if (window.scrollY > 300) {
          hasScrolled.current = true;
          
          // Show toast notification instead of modal
          if (!hasShownToast.current) {
            toast({
              title: "Sign-in Reminder",
              description: "Sign in to save your progress and access more features.",
              duration: 5000,
            });
            hasShownToast.current = true;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [session, location.pathname, toast]);

  // Handle user interaction
  const handleInteraction = () => {
    if (!hasInteracted.current) {
      hasInteracted.current = true;
      // Store in session storage so it persists across page navigations
      sessionStorage.setItem('userInteracted', 'true');
    }
  };

  return (
    <div onClick={handleInteraction} onKeyDown={handleInteraction}>
      {children}
    </div>
  );
};

export default ScrollListener;
