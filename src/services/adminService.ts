
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

  // New enhanced dashboard methods
  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const { data, error } = await supabase.rpc('get_admin_dashboard_stats');
      
      if (error) throw error;
      
      return data[0] || {
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
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      throw error;
    }
  }

  async getUserActivityStats(): Promise<UserActivityStats[]> {
    try {
      const { data, error } = await supabase.rpc('get_user_activity_stats');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching user activity stats:', error);
      throw error;
    }
  }

  async getModerationQueue(): Promise<ModerationQueueItem[]> {
    try {
      const { data, error } = await supabase.rpc('get_moderation_queue');
      
      if (error) throw error;
      
      return data || [];
    } catch (error) {
      console.error('Error fetching moderation queue:', error);
      throw error;
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
      throw error;
    }
  }

  async updateSystemMetrics(): Promise<void> {
    try {
      const { error } = await supabase.rpc('update_system_metrics');
      
      if (error) throw error;
    } catch (error) {
      console.error('Error updating system metrics:', error);
      throw error;
    }
  }

  async logAdminAction(action: string, resourceType: string, resourceId?: string, details?: any): Promise<void> {
    try {
      const { error } = await supabase.rpc('log_admin_action', {
        p_action: action,
        p_resource_type: resourceType,
        p_resource_id: resourceId,
        p_details: details ? JSON.stringify(details) : null
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

      // Create or update admin session
      const { data, error } = await supabase.rpc('create_admin_session', {
        p_user_id: user.id,
        p_email: user.email
      });

      if (error) throw error;
      
      // If no session was created, it means the limit was reached
      return data && data.length > 0;
    } catch (error) {
      console.error('Error checking admin session:', error);
      return false;
    }
  }

  async cleanupAdminSession(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('admin_sessions')
        .update({ is_active: false })
        .eq('user_id', user.id);

      if (error) throw error;
    } catch (error) {
      console.error('Error cleaning up admin session:', error);
    }
  }

  async populateSampleData(): Promise<void> {
    try {
      // Insert sample resources
      const sampleResources = [
        {
          title: 'Understanding Kenya\'s Constitution',
          description: 'A comprehensive guide to understanding the 2010 Constitution of Kenya and its key provisions.',
          category: 'Legal Documents',
          type: 'PDF',
          url: '/resources/constitution-guide.pdf',
          thumbnail_url: '/lovable-uploads/constitution-thumbnail.png',
          is_downloadable: true
        },
        {
          title: 'Citizen\'s Guide to Governance',
          description: 'Learn how government works and how citizens can participate in democratic processes.',
          category: 'Civic Education',
          type: 'Video',
          url: 'https://www.youtube.com/watch?v=example1',
          thumbnail_url: '/lovable-uploads/governance-thumbnail.png',
          is_downloadable: false
        },
        {
          title: 'Your Rights and Freedoms',
          description: 'An interactive guide to understanding your fundamental rights and freedoms as a Kenyan citizen.',
          category: 'Human Rights',
          type: 'Interactive',
          url: '/resources/rights-guide',
          thumbnail_url: '/lovable-uploads/rights-thumbnail.png',
          is_downloadable: false
        }
      ];

      for (const resource of sampleResources) {
        await supabase.from('resources').insert(resource);
      }

      console.log('Sample data populated successfully');
    } catch (error) {
      console.error('Error populating sample data:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService();
