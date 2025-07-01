
import { useState, useEffect } from 'react';
import { adminService } from '@/services/adminService';
import { useToast } from '@/hooks/use-toast';

export const useAdminAccess = () => {
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [sessionLimited, setSessionLimited] = useState<boolean>(false);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminAccess();
    
    // Cleanup session on page unload
    const handleBeforeUnload = () => {
      adminService.cleanupAdminSession();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      adminService.cleanupAdminSession();
    };
  }, []);

  const checkAdminAccess = async () => {
    try {
      setIsLoading(true);
      
      // First check if user is admin
      const isUserAdmin = await adminService.isUserAdmin();
      
      if (!isUserAdmin) {
        setIsAdmin(false);
        setIsLoading(false);
        return;
      }

      // Then check session management
      const hasSessionAccess = await adminService.checkAdminWithSessionManagement();
      
      if (!hasSessionAccess) {
        setSessionLimited(true);
        setIsAdmin(false);
        toast({
          title: "Admin Session Limit Reached",
          description: "Maximum of 3 concurrent admin sessions allowed. Please try again later.",
          variant: "destructive",
        });
      } else {
        setIsAdmin(true);
        setSessionLimited(false);
      }
    } catch (error) {
      console.error('Error checking admin access:', error);
      setIsAdmin(false);
      toast({
        title: "Admin Access Error",
        description: "Unable to verify admin access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshAdminAccess = () => {
    checkAdminAccess();
  };

  return {
    isAdmin,
    isLoading,
    sessionLimited,
    refreshAdminAccess
  };
};
