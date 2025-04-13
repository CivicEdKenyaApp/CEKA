
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/App';
import AuthModal from './AuthModal';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';
import { useToast } from "@/hooks/use-toast";

interface ScrollListenerProps {
  children: React.ReactNode;
}

const ScrollListener = ({ children }: ScrollListenerProps) => {
  const [showAuth, setShowAuth] = useState(false);
  const [isBlurred, setIsBlurred] = useState(false);
  const [showReminder, setShowReminder] = useState(false);
  const { session, loading } = useAuth();
  const hasTriggered = useRef(false);
  const hasInteracted = useRef(false);
  const { language } = useLanguage();
  const { toast } = useToast();
  
  // Check session storage on component mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const dismissed = sessionStorage.getItem('authModalDismissed');
      const wasTriggered = sessionStorage.getItem('authModalTriggered');
      const hasUserInteracted = sessionStorage.getItem('authModalInteracted');
      
      // If modal was previously dismissed but user not logged in, show reminder
      if (dismissed === 'true' && !session) {
        setShowReminder(true);
      }
      
      // If user previously triggered or interacted with modal this session, restore the state
      if (wasTriggered === 'true') {
        hasTriggered.current = true;
      }
      
      if (hasUserInteracted === 'true') {
        hasInteracted.current = true;
      }
    }
  }, [session]);
  
  useEffect(() => {
    if (loading) return;
    
    if (!session && !hasInteracted.current) {
      const handleScroll = () => {
        // Check if already triggered this session
        if (window.scrollY > 150 && !hasTriggered.current) {
          hasTriggered.current = true;
          sessionStorage.setItem('authModalTriggered', 'true');
          
          // Only show modal if not previously dismissed
          const dismissed = sessionStorage.getItem('authModalDismissed');
          if (dismissed !== 'true') {
            setIsBlurred(true);
            setTimeout(() => setShowAuth(true), 300);
          } else {
            // If previously dismissed, just show reminder
            setShowReminder(true);
          }
        }
      };
      
      window.addEventListener('scroll', handleScroll);
      return () => window.removeEventListener('scroll', handleScroll);
    } else {
      // Reset states if user logs in
      setIsBlurred(false);
      setShowReminder(false);
    }
  }, [session, loading]);
  
  const handleAuthModalClose = (open: boolean) => {
    // Mark that user has interacted with the auth modal
    if (showAuth && !open) {
      hasInteracted.current = true;
      sessionStorage.setItem('authModalInteracted', 'true');
    }
    
    setShowAuth(open);
    
    if (!open) {
      // When modal is closed without logging in
      setTimeout(() => setIsBlurred(false), 300);
      
      // Mark as dismissed in session storage
      sessionStorage.setItem('authModalDismissed', 'true');
      
      // Only show reminder if user is not logged in
      if (!session) {
        setTimeout(() => {
          setShowReminder(true);
          // Show toast notification
          toast({
            title: translate("Sign-in Reminder", language),
            description: translate("Sign in to access all CEKA features", language),
          });
        }, 1000);
      }
    }
  };

  const handleReminderClick = () => {
    setIsBlurred(true);
    setTimeout(() => setShowAuth(true), 300);
    setShowReminder(false);
  };

  // Reset everything when user logs in
  useEffect(() => {
    if (session) {
      setIsBlurred(false);
      setShowReminder(false);
      setShowAuth(false);
    }
  }, [session]);

  const blurStyles = isBlurred && !session 
    ? 'after:absolute after:inset-0 after:bg-gradient-to-tr after:from-[#006600]/20 after:via-[#141414]/15 after:to-[#BB1600]/20 after:z-[-1]' 
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
      
      {/* Auth Reminder Notification */}
      <AnimatePresence>
        {showReminder && !session && !showAuth && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            className="fixed top-20 right-4 z-50"
          >
            <TooltipProvider delayDuration={0}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <motion.button 
                    onClick={handleReminderClick}
                    className="flex items-center justify-center p-3 bg-kenya-green rounded-full shadow-lg"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    animate={{ 
                      boxShadow: ["0 4px 12px rgba(0, 102, 0, 0.3)", "0 6px 16px rgba(0, 102, 0, 0.5)"],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      repeatType: "reverse", 
                      duration: 1.5 
                    }}
                    aria-label={translate("Sign in reminder", language)}
                  >
                    <Bell className="text-white" />
                  </motion.button>
                </TooltipTrigger>
                <TooltipContent side="left" className="bg-white/90 backdrop-blur-sm p-3 shadow-md text-sm font-medium border border-kenya-green/20">
                  <p>{translate("Sign in to access all CEKA features", language)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </motion.div>
        )}
      </AnimatePresence>

      <AuthModal 
        open={showAuth} 
        onOpenChange={handleAuthModalClose} 
      />
    </>
  );
};

export default ScrollListener;
