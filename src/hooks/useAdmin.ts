
import { useState, useEffect } from 'react';
import { adminService, AdminNotification } from '@/services/adminService';
import { BlogPost } from '@/services/blogService';

export function useAdmin() {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [draftPosts, setDraftPosts] = useState<BlogPost[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const adminStatus = await adminService.isUserAdmin();
      setIsAdmin(adminStatus);
      
      if (adminStatus) {
        await loadAdminData();
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAdminData = async () => {
    try {
      const [notificationsData, draftsData] = await Promise.all([
        adminService.getAdminNotifications(),
        adminService.getDraftPosts()
      ]);
      
      setNotifications(notificationsData);
      setDraftPosts(draftsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
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
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await adminService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const updatePostStatus = async (postId: string, status: 'published' | 'draft' | 'archived', adminNotes?: string) => {
    try {
      await adminService.updatePostStatus(postId, status, adminNotes);
      await loadAdminData();
    } catch (error) {
      console.error('Error updating post status:', error);
      throw error;
    }
  };

  const schedulePost = async (postId: string, scheduledAt: string) => {
    try {
      await adminService.schedulePost(postId, scheduledAt);
      await loadAdminData();
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw error;
    }
  };

  const rejectPost = async (postId: string, rejectionReason: string) => {
    try {
      await adminService.rejectPost(postId, rejectionReason);
      await loadAdminData();
    } catch (error) {
      console.error('Error rejecting post:', error);
      throw error;
    }
  };

  return {
    notifications,
    draftPosts,
    isAdmin,
    loading,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    updatePostStatus,
    schedulePost,
    rejectPost,
    refreshAdminData: loadAdminData
  };
}
