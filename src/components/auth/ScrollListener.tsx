'use client';

import { useEffect, useState } from 'react';
import { useAuthModal } from '@/hooks/useAuthModal';
import { useSession } from 'next-auth/react';

const ScrollTrigger = () => {
  const { data: session } = useSession();
  const { onOpen } = useAuthModal();
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const hasShown = sessionStorage.getItem('authModalShown');
      const dismissed = sessionStorage.getItem('authModalDismissed');
      const signedIn = !!session;

      if (!hasShown && !dismissed && !signedIn) {
        onOpen();
        sessionStorage.setItem('authModalShown', 'true');
        setHasTriggered(true);
      }
    };

    if (!hasTriggered && !session) {
      window.addEventListener('scroll', handleScroll, { passive: true });
    }

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [onOpen, hasTriggered, session]);

  return null;
};

export default ScrollTrigger;
