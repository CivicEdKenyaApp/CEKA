
import { supabase } from '@/integrations/supabase/client';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

class AdminService {
  async getAdminNotifications(): Promise<AdminNotification[]> {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching admin notifications:', error);
      throw error;
    }
  }

  async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async markAllNotificationsAsRead(): Promise<void> {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ is_read: true })
        .eq('is_read', false);

      if (error) throw error;
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  }

  async isUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single();

      if (error) return false;
      return data?.email === 'civiceducationkenya@gmail.com';
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async getDraftPosts() {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching draft posts:', error);
      throw error;
    }
  }

  async updatePostStatus(postId: string, status: 'published' | 'draft' | 'archived', adminNotes?: string) {
    try {
      const updateData: any = { status };
      
      if (status === 'published') {
        updateData.published_at = new Date().toISOString();
      }
      
      if (adminNotes) {
        updateData.admin_notes = adminNotes;
      }

      const { error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating post status:', error);
      throw error;
    }
  }

  async schedulePost(postId: string, scheduledAt: string) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          scheduled_at: scheduledAt,
          status: 'draft'
        })
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error scheduling post:', error);
      throw error;
    }
  }

  async rejectPost(postId: string, rejectionReason: string) {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ 
          rejection_reason: rejectionReason,
          status: 'archived'
        })
        .eq('id', postId);

      if (error) throw error;
    } catch (error) {
      console.error('Error rejecting post:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
