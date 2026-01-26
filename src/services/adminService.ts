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
  total_interactions: number;
}

export interface UserActivityStats {
  date: string;
  new_users: number;
  active_users: number;
  blog_posts: number;
  discussions: number;
  interactions: number;
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

const ROOT_ADMIN_EMAIL = "civiceducationkenya@gmail.com";

class AdminService {
  /**
   * Check if current user is admin using secure user_roles table
   */
  async isUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      // Root Bypass for legacy support
      if (user.email === ROOT_ADMIN_EMAIL) return true;

      // Primary check: user_roles table via RPC
      const { data: hasAdminRole, error: rpcError } = await supabase.rpc('check_user_is_admin');
      if (!rpcError && hasAdminRole) return true;

      // Fallback: check user_roles table directly
      const { data: roleData } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .maybeSingle();

      if (roleData) return true;

      // Legacy fallback: profiles table is_admin column
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .maybeSingle();

      return profile?.is_admin || false;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }

  async getAdminNotifications(): Promise<AdminNotification[]> {
    const { data } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('created_at', { ascending: false });
    return (data as AdminNotification[] || []);
  }

  async markNotificationAsRead(id: string): Promise<void> {
    await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('id', id);
  }

  async markAllNotificationsAsRead(): Promise<void> {
    await supabase
      .from('admin_notifications')
      .update({ is_read: true })
      .eq('is_read', false);
  }

  async getDraftPosts(): Promise<BlogPost[]> {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'draft')
      .order('created_at', { ascending: false });
    return (data as BlogPost[] || []);
  }

  async updatePostStatus(postId: string, status: 'published' | 'draft' | 'archived', adminNotes?: string): Promise<void> {
    const updates: Record<string, any> = {
      status,
      updated_at: new Date().toISOString()
    };
    
    if (adminNotes) {
      updates.admin_notes = adminNotes;
    }
    
    if (status === 'published') {
      updates.published_at = new Date().toISOString();
    }

    await supabase
      .from('blog_posts')
      .update(updates)
      .eq('id', postId);
    
    await this.logAdminAction('update_post_status', 'blog_post', postId, { new_status: status, admin_notes: adminNotes });
  }

  async schedulePost(postId: string, scheduledAt: string): Promise<void> {
    await supabase
      .from('blog_posts')
      .update({
        scheduled_at: scheduledAt,
        status: 'draft',
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
    
    await this.logAdminAction('schedule_post', 'blog_post', postId, { scheduled_at: scheduledAt });
  }

  async rejectPost(postId: string, rejectionReason: string): Promise<void> {
    await supabase
      .from('blog_posts')
      .update({
        status: 'draft',
        rejection_reason: rejectionReason,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId);
    
    await this.logAdminAction('reject_post', 'blog_post', postId, { rejection_reason: rejectionReason });
  }

  async getVolunteerApplications(): Promise<any[]> {
    const { data } = await supabase
      .from('volunteer_applications')
      .select(`*, profiles:user_id (full_name, email), volunteer_opportunities (title)`)
      .order('created_at', { ascending: false });
    return (data as any[] || []);
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: totalResources },
        { count: totalBills },
        { count: activeSessions },
        { count: totalDiscussions },
        { count: totalInteractions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('bills').select('*', { count: 'exact', head: true }),
        supabase.from('admin_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('discussions').select('*', { count: 'exact', head: true }),
        supabase.from('chat_interactions').select('*', { count: 'exact', head: true })
      ]);

      return {
        total_users: totalUsers || 0,
        total_posts: totalPosts || 0,
        total_resources: totalResources || 0,
        total_bills: totalBills || 0,
        active_sessions: activeSessions || 0,
        recent_signups: totalUsers ? Math.ceil(totalUsers * 0.05) : 0,
        pending_drafts: 0,
        total_discussions: totalDiscussions || 0,
        total_views: (totalInteractions || 0) * 0.8,
        total_interactions: totalInteractions || 0,
        avg_daily_users: (totalUsers || 0) * 0.1
      };
    } catch {
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
        avg_daily_users: 0,
        total_interactions: 0
      };
    }
  }

  async getUserActivityStats(): Promise<UserActivityStats[]> {
    try {
      const { data: interactions } = await supabase
        .from('chat_interactions')
        .select('created_at')
        .limit(1000);
      
      const dailyMap: Record<string, UserActivityStats> = {};
      
      (interactions as any[])?.forEach(item => {
        const d = item.created_at.split('T')[0];
        if (!dailyMap[d]) {
          dailyMap[d] = { date: d, new_users: 0, active_users: 0, blog_posts: 0, discussions: 0, interactions: 0 };
        }
        dailyMap[d].interactions++;
      });
      
      return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    } catch {
      return [];
    }
  }

  async getActiveSessions(): Promise<AdminSession[]> {
    const { data } = await supabase
      .from('admin_sessions')
      .select('*')
      .eq('is_active', true)
      .order('last_active', { ascending: false });
    return (data as AdminSession[] || []);
  }

  async updateSystemMetrics(): Promise<void> {
    const stats = await this.getDashboardStats();
    const today = new Date().toISOString().split('T')[0];

    await supabase.from('system_metrics').upsert([
      { metric_name: 'total_users', metric_value: stats.total_users, metric_date: today },
      { metric_name: 'total_posts', metric_value: stats.total_posts, metric_date: today },
      { metric_name: 'total_resources', metric_value: stats.total_resources, metric_date: today },
      { metric_name: 'active_sessions', metric_value: stats.active_sessions, metric_date: today }
    ], { onConflict: 'metric_name,metric_date' });

    await this.logAdminAction('update_metrics', 'system', undefined, stats);
  }

  async generateWeeklyReport(): Promise<any> {
    const stats = await this.getDashboardStats();
    const activity = await this.getUserActivityStats();
    
    const report = {
      generated_at: new Date().toISOString(),
      period: 'weekly',
      summary: stats,
      daily_activity: activity.slice(-7),
      version: '2.0'
    };

    await this.logAdminAction('generate_report', 'system', undefined, { type: 'weekly' });

    // Return report data for download
    return report;
  }

  async logAdminAction(action: string, resourceType: string, resourceId?: string, details?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase.from('admin_audit_log').insert({
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {}
    });
  }

  async getAdminAuditLogs(limit = 50): Promise<any[]> {
    const { data } = await supabase
      .from('admin_audit_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    return (data as any[] || []);
  }

  async getModerationQueue(): Promise<ModerationQueueItem[]> {
    const { data } = await supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'draft');
    
    return (data || []).map(p => ({
      id: p.id,
      type: 'blog_post',
      title: p.title,
      author: p.author || 'Member',
      created_at: p.created_at,
      status: p.status,
      content_preview: p.content?.substring(0, 100) || ''
    }));
  }

  async checkAdminWithSessionManagement(): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    
    if (user.email === ROOT_ADMIN_EMAIL) return true;

    const { count } = await supabase
      .from('admin_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    return (count || 0) < 3;
  }

  async cleanupAdminSession(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    await supabase
      .from('admin_sessions')
      .update({ is_active: false })
      .eq('user_id', user.id);
  }
}

export const adminService = new AdminService();
