
import React, { useEffect, useRef, useState } from 'react';
import { ArrowDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from '@/components/ui/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate } from '@/lib/utils';

interface PullToRefreshProps {
  children: React.ReactNode;
}

const PullToRefresh: React.FC<PullToRefreshProps> = ({ children }) => {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPulling, setIsPulling] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const { toast } = useToast();
  const { language } = useLanguage();
  const startY = useRef(0);
  const threshold = 80; // Pull distance required to trigger refresh

  const handleTouchStart = (e: TouchEvent) => {
    // Only enable pull to refresh at the top of the page
    if (window.scrollY <= 0) {
      startY.current = e.touches[0].clientY;
      setIsPulling(true);
    }
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isPulling) return;
    
    const currentY = e.touches[0].clientY;
    const distance = currentY - startY.current;
    
    // Only pull down, not up
    if (distance > 0) {
      // Apply resistance to make the pull feel more natural
      const newDistance = Math.min(distance * 0.5, threshold * 1.5);
      setPullDistance(newDistance);
      
      if (containerRef.current) {
        containerRef.current.style.transform = `translateY(${newDistance}px)`;
      }
    }
  };

  const handleTouchEnd = () => {
    if (!isPulling) return;
    
    setIsPulling(false);
    if (containerRef.current) {
      containerRef.current.style.transform = 'translateY(0)';
    }
    
    if (pullDistance > threshold) {
      // Refresh the page content
      refreshContent();
    }
    
    setPullDistance(0);
  };

  const refreshContent = () => {
    // Show a toast notification
    toast({
      title: translate("Refreshing", language),
      description: translate("Updating content...", language),
    });
    
    // Simulate refresh action - in a real app, this would fetch new data
    setTimeout(() => {
      window.location.reload();
    }, 500);
  };

  useEffect(() => {
    if (!isMobile) return;
    
    window.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('touchend', handleTouchEnd);
    
    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, isPulling]);

  return (
    <div ref={containerRef} style={{ transition: isPulling ? 'none' : 'transform 0.3s ease-out' }}>
      {isMobile && (
        <div 
          className="pull-to-refresh-indicator flex items-center justify-center h-8 pointer-events-none" 
          style={{ 
            opacity: Math.min(pullDistance / threshold, 1),
            transform: `rotate(${Math.min(pullDistance / threshold * 180, 180)}deg)`
          }}
        >
          <ArrowDown className="h-5 w-5 text-primary" />
        </div>
      )}
      {children}
    </div>
  );
};

export default PullToRefresh;
