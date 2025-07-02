
import { supabase } from '@/integrations/supabase/client';
import { BlogPost } from '@/services/blogService';

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  message: string;
  related_id: string | null;
  is_read: boolean;
  created_at: string;
}

export interface AdminSession {
  id: string;
  user_id: string;
  email: string;
  session_token: string;
  created_at: string;
  last_active: string;
  expires_at: string;
  is_active: boolean;
}

export interface AdminDashboardStats {
  total_users: number;
  total_posts: number;
  total_resources: number;
  total_bills: number;
  active_sessions: number;
  recent_signups: number;
  pending_drafts: number;
  total_discussions: number;
  total_views: number;
  avg_daily_users: number;
}

export interface UserActivityStats {
  date: string;
  new_users: number;
  active_users: number;
  blog_posts: number;
  discussions: number;
}

export interface ModerationQueueItem {
  id: string;
  type: string;
  title: string;
  author: string;
  created_at: string;
  status: string;
  content_preview: string;
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

      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      if (error) {
        console.error('Error checking admin status:', error);
        return false;
      }
      
      return data || false;
    } catch (error) {
      console.error('Error checking admin status:', error);
      return false;
    }
  }

  async getDraftPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(post => ({
        ...post,
        published_at: post.published_at || post.created_at,
        status: (post.status as 'draft' | 'published' | 'archived') || 'draft',
        tags: post.tags || [],
        author: post.author || 'Anonymous',
        excerpt: post.excerpt || '',
        created_at: post.created_at || '',
        updated_at: post.updated_at || ''
      }));
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

      // Log admin action
      await this.logAdminAction('update_post_status', 'blog_post', postId, { 
        status, 
        admin_notes: adminNotes 
      });
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

      await this.logAdminAction('schedule_post', 'blog_post', postId, { 
        scheduled_at: scheduledAt 
      });
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

      await this.logAdminAction('reject_post', 'blog_post', postId, { 
        rejection_reason: rejectionReason 
      });
    } catch (error) {
      console.error('Error rejecting post:', error);
      throw error;
    }
  }

  // Enhanced dashboard methods - using direct table queries instead of RPC calls
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      // Get all stats with individual queries to avoid RPC issues
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: totalResources },
        { count: totalBills },
        { count: activeSessions },
        { count: recentSignups },
        { count: pendingDrafts },
        { count: totalDiscussions },
        { count: totalViews }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('bills').select('*', { count: 'exact', head: true }),
        supabase.from('admin_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('discussions').select('*', { count: 'exact', head: true }),
        supabase.from('resource_views').select('*', { count: 'exact', head: true })
      ]);

      return {
        total_users: totalUsers || 0,
        total_posts: totalPosts || 0,
        total_resources: totalResources || 0,
        total_bills: totalBills || 0,
        active_sessions: activeSessions || 0,
        recent_signups: recentSignups || 0,
        pending_drafts: pendingDrafts || 0,
        total_discussions: totalDiscussions || 0,
        total_views: totalViews || 0,
        avg_daily_users: 0 // Calculate separately if needed
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        total_users: 0,
        total_posts: 0,
        total_resources: 0,
        total_bills: 0,
        active_sessions: 0,
        recent_signups: 0,
        pending_drafts: 0,
        total_discussions: 0,
        total_views: 0,
        avg_daily_users: 0
      };
    }
  }

  async getUserActivityStats(): Promise<UserActivityStats[]> {
    try {
      // Generate last 30 days of data
      const stats: UserActivityStats[] = [];
      const today = new Date();
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        
        stats.push({
          date: date.toISOString().split('T')[0],
          new_users: Math.floor(Math.random() * 10), // Mock data for now
          active_users: Math.floor(Math.random() * 50),
          blog_posts: Math.floor(Math.random() * 5),
          discussions: Math.floor(Math.random() * 15)
        });
      }
      
      return stats;
    } catch (error) {
      console.error('Error fetching user activity stats:', error);
      return [];
    }
  }

  async getModerationQueue(): Promise<ModerationQueueItem[]> {
    try {
      const { data: draftPosts, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'draft')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (draftPosts || []).map(post => ({
        id: post.id,
        type: 'blog_post',
        title: post.title,
        author: post.author || 'Anonymous',
        created_at: post.created_at,
        status: post.status,
        content_preview: post.content ? post.content.substring(0, 200) : ''
      }));
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      return [];
    }
  }

  async getActiveSessions(): Promise<AdminSession[]> {
    try {
      const { data, error } = await supabase
        .from('admin_sessions')
        .select('*')
        .eq('is_active', true)
        .order('last_active', { ascending: false });

      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching active sessions:', error);
      return [];
    }
  }

  async updateSystemMetrics(): Promise<void> {
    try {
      // Simple implementation - just log the action
      await this.logAdminAction('update_system_metrics', 'system', null, { 
        timestamp: new Date().toISOString() 
      });
    } catch (error) {
      console.error('Error updating system metrics:', error);
      throw error;
    }
  }

  async logAdminAction(action: string, resourceType: string, resourceId?: string, details?: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('admin_audit_log')
        .insert({
          user_id: user.id,
          action,
          resource_type: resourceType,
          resource_id: resourceId,
          details: details ? JSON.stringify(details) : null
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error logging admin action:', error);
      // Don't throw here as we don't want to break main functionality
    }
  }

  async checkAdminWithSessionManagement(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const isAdmin = await this.isUserAdmin();
      if (!isAdmin) return false;

      // For now, just return true if user is admin
      // In a real implementation, you would check session limits
      return true;
    } catch (error) {
      console.error('Error checking admin session:', error);
      return false;
    }
  }

  async cleanupAdminSession(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Log the cleanup action
      await this.logAdminAction('cleanup_session', 'admin_session', user.id, {
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error cleaning up admin session:', error);
    }
  }
}

export const adminService = new AdminService();
