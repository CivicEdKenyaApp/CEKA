import { useState, useEffect } from 'react';
import { adminService, AdminNotification, AdminDashboardStats, UserActivityStats, ModerationQueueItem } from '@/services/adminService';
import { BlogPost } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';

export function useEnhancedAdmin() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [draftPosts, setDraftPosts] = useState<BlogPost[]>([]);
  const [dashboardStats, setDashboardStats] = useState<AdminDashboardStats | null>(null);
  const [activityStats, setActivityStats] = useState<UserActivityStats[]>([]);
  const [moderationQueue, setModerationQueue] = useState<ModerationQueueItem[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    checkAdminStatusAndLoadData();
    
    // Set up periodic refresh every 5 minutes
    const interval = setInterval(loadAdminData, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const checkAdminStatusAndLoadData = async () => {
    try {
      const adminStatus = await adminService.isUserAdmin();
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        await loadAdminData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      toast({
        title: "Error",
        description: "Unable to verify admin access. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [
        notificationsData,
        draftsData,
        statsData,
        activityData,
        queueData
      ] = await Promise.all([
        adminService.getAdminNotifications(),
        adminService.getDraftPosts(),
        adminService.getDashboardStats(),
        adminService.getUserActivityStats(),
        adminService.getModerationQueue()
      ]);
      
      setNotifications(notificationsData);
      setDraftPosts(draftsData);
      setDashboardStats(statsData);
      setActivityStats(activityData);
      setModerationQueue(queueData);
    } catch (error) {
      console.error('Error loading admin data:', error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    try {
      await adminService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark notification as read",
        variant: "destructive",
      });
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to mark all notifications as read",
        variant: "destructive",
      });
    }
  };

  const updatePostStatus = async (postId: string, status: 'published' | 'draft' | 'archived', adminNotes?: string) => {
    try {
      await adminService.updatePostStatus(postId, status, adminNotes);
      await loadAdminData();
      toast({
        title: "Success",
        description: `Post ${status} successfully`,
      });
    } catch (error) {
      console.error('Error updating post status:', error);
      toast({
        title: "Error",
        description: "Failed to update post status",
        variant: "destructive",
      });
      throw error;
    }
  };

  const schedulePost = async (postId: string, scheduledAt: string) => {
    try {
      await adminService.schedulePost(postId, scheduledAt);
      await loadAdminData();
      toast({
        title: "Success",
        description: "Post scheduled successfully",
      });
    } catch (error) {
      console.error('Error scheduling post:', error);
      toast({
        title: "Error",
        description: "Failed to schedule post",
        variant: "destructive",
      });
      throw error;
    }
  };

  const rejectPost = async (postId: string, rejectionReason: string) => {
    try {
      await adminService.rejectPost(postId, rejectionReason);
      await loadAdminData();
      toast({
        title: "Success",
        description: "Post rejected",
      });
    } catch (error) {
      console.error('Error rejecting post:', error);
      toast({
        title: "Error",
        description: "Failed to reject post",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateSystemMetrics = async () => {
    try {
      await adminService.updateSystemMetrics();
      await loadAdminData();
      toast({
        title: "Success",
        description: "System metrics updated successfully",
      });
    } catch (error) {
      console.error('Error updating system metrics:', error);
      toast({
        title: "Error",
        description: "Failed to update system metrics",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    notifications,
    draftPosts,
    dashboardStats,
    activityStats,
    moderationQueue,
    isAdmin,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updatePostStatus,
    schedulePost,
    rejectPost,
    updateSystemMetrics,
    refreshAdminData: loadAdminData
  };
}
