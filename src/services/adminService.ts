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
      const { data, error } = await supabase
        .from('admin_intelligence_summary' as any)
        .select('*')
        .single();

      if (error) throw error;

      const statsData = data as any;

      const [
        totalPosts,
        totalResources,
        totalBills,
        totalSessions,
        pendingDrafts,
        totalDiscussions,
        totalViewsRes
      ] = await Promise.all([
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('bills').select('*', { count: 'exact', head: true }),
        supabase.from('admin_sessions').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('discussions').select('*', { count: 'exact', head: true }),
        supabase.from('bills').select('views_count')
      ]);

      const totalViews = (totalViewsRes.data || []).reduce((acc, b) => acc + (b.views_count || 0), 0);

      return {
        total_users: statsData?.total_users || 0,
        total_posts: totalPosts.count || 0,
        total_resources: totalResources.count || 0,
        total_bills: totalBills.count || 0,
        active_sessions: totalSessions.count || 0,
        recent_signups: statsData?.total_users ? Math.ceil(statsData.total_users * 0.05) : 0, // Still heuristic as we don't have a daily signups view yet
        pending_drafts: pendingDrafts.count || 0,
        total_discussions: totalDiscussions.count || 0,
        total_views: totalViews || 0,
        total_interactions: statsData?.chat_activity_24h || 0,
        avg_daily_users: (statsData?.total_users || 0) * 0.1
      };
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
      return {
        total_users: 0, total_posts: 0, total_resources: 0, total_bills: 0,
        active_sessions: 0, recent_signups: 0, pending_drafts: 0,
        total_discussions: 0, total_views: 0, avg_daily_users: 0, total_interactions: 0
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

  // --- PHASE 2 MANAGEMENT FUNCTIONS ---

  /**
   * Fetch items pending media appraisal
   */
  async getQuarantineQueue(): Promise<ModerationQueueItem[]> {
    const [blogRes, resourceRes, constitutionRes] = await Promise.all([
      (supabase.from('blog_posts' as any) as any).select('*').eq('media_status', 'quarantined'),
      (supabase.from('resources' as any) as any).select('*').eq('media_status', 'quarantined'),
      (supabase.from('constitution_sections' as any) as any).select('*').eq('media_status', 'quarantined')
    ]);

    const items: ModerationQueueItem[] = [];

    (blogRes.data || []).forEach((p: any) => items.push({
      id: p.id, type: 'blog_post', title: p.title, author: p.author || 'Member',
      created_at: p.created_at, status: p.media_status, content_preview: p.content?.substring(0, 100) || ''
    }));

    (resourceRes.data || []).forEach((r: any) => items.push({
      id: r.id, type: 'resource', title: r.title, author: r.provider || 'Contributor',
      created_at: r.created_at, status: r.media_status, content_preview: r.description?.substring(0, 100) || ''
    }));

    (constitutionRes.data || []).forEach((s: any) => items.push({
      id: s.id, type: 'constitution_section', title: s.title_en, author: 'AI/Editor',
      created_at: s.created_at, status: s.media_status, content_preview: s.content_en?.substring(0, 100) || ''
    }));

    return items.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  /**
   * Approve or reject media
   */
  async updateMediaStatus(id: string | number, type: string, status: 'approved' | 'rejected'): Promise<void> {
    let table = '';
    if (type === 'blog_post') table = 'blog_posts';
    if (type === 'resource') table = 'resources';
    if (type === 'constitution_section') table = 'constitution_sections';

    if (!table) return;

    await (supabase.from(table as any) as any)
      .update({ media_status: status })
      .eq('id', id);

    await this.logAdminAction('update_media_status', type, id.toString(), { status });
  }

  /**
   * Volunteer Opportunity Management
   */
  async getVolunteerOpportunities(): Promise<any[]> {
    const { data } = await (supabase.from('volunteer_opportunities' as any) as any)
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async updateVolunteerStatus(id: string, status: 'approved' | 'rejected' | 'pending' | 'closed'): Promise<void> {
    await (supabase.from('volunteer_opportunities' as any) as any)
      .update({ status })
      .eq('id', id);

    await this.logAdminAction('update_volunteer_status', 'volunteer_opportunity', id, { status });
  }

  /**
   * Campaign Management
   */
  async getCampaigns(): Promise<any[]> {
    const { data } = await (supabase.from('platform_campaigns' as any) as any)
      .select('*')
      .order('created_at', { ascending: false });
    return data || [];
  }

  async saveCampaign(campaign: any): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    const payload = { ...campaign, created_by: user?.id };

    if (campaign.id) {
      await (supabase.from('platform_campaigns' as any) as any).update(payload).eq('id', campaign.id);
    } else {
      await (supabase.from('platform_campaigns' as any) as any).insert(payload);
    }

    await this.logAdminAction('save_campaign', 'platform_campaign', campaign.id || 'new', campaign);
  }
}

export const adminService = new AdminService();
