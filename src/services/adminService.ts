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

class AdminService {
  async isUserAdmin(): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;
      const { data, error } = await supabase.rpc('is_admin', { user_id: user.id });
      return data || false;
    } catch { return false; }
  }

  async getDashboardStats(): Promise<AdminDashboardStats> {
    try {
      const [
        { count: totalUsers },
        { count: totalPosts },
        { count: totalResources },
        { count: totalBills },
        { count: activeSessions },
        { count: recentSignups },
        { count: pendingDrafts },
        { count: totalDiscussions },
        { count: totalInteractions }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
        supabase.from('resources').select('*', { count: 'exact', head: true }),
        supabase.from('bills').select('*', { count: 'exact', head: true }),
        supabase.from('admin_sessions' as any).select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
        supabase.from('discussions' as any).select('*', { count: 'exact', head: true }),
        supabase.from('chat_interactions' as any).select('*', { count: 'exact', head: true })
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
        total_views: (totalInteractions || 0) * 0.8, // Approximation based on interaction data
        total_interactions: totalInteractions || 0,
        avg_daily_users: (totalUsers || 0) * 0.1
      };
    } catch (error) {
      console.error('Stats error:', error);
      return { total_users: 0, total_posts: 0, total_resources: 0, total_bills: 0, active_sessions: 0, recent_signups: 0, pending_drafts: 0, total_discussions: 0, total_views: 0, avg_daily_users: 0, total_interactions: 0 };
    }
  }

  async getUserActivityStats(): Promise<UserActivityStats[]> {
    try {
      const { data: interactions } = await supabase
        .from('chat_interactions' as any)
        .select('created_at, action_type')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      const { data: signups } = await supabase
        .from('profiles')
        .select('created_at')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());

      // Aggregation logic
      const dailyMap: Record<string, UserActivityStats> = {};
      const today = new Date();
      for (let i = 0; i < 30; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        dailyMap[dateStr] = { date: dateStr, new_users: 0, active_users: 0, blog_posts: 0, discussions: 0, interactions: 0 };
      }

      (interactions as any[])?.forEach(item => {
        const d = (item as any).created_at.split('T')[0];
        if (dailyMap[d]) dailyMap[d].interactions++;
      });

      (signups as any[])?.forEach(item => {
        const d = (item as any).created_at.split('T')[0];
        if (dailyMap[d]) dailyMap[d].new_users++;
      });

      return Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    } catch (error) {
      console.error('Activity stats error:', error);
      return [];
    }
  }

  async generateWeeklyReport() {
    const stats = await this.getDashboardStats();
    const activity = await this.getUserActivityStats();

    const report = {
      timestamp: new Date().toISOString(),
      platform: "CEKA Digital Commons",
      summary: stats,
      engagement_trend: activity.slice(-7),
      logs_sample: await this.getAdminAuditLogs(20)
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CEKA_Weekly_Report_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async updateSystemMetrics(): Promise<void> {
    await this.logAdminAction('recalibrate_metrics', 'system', 'global');
  }

  async getAdminAuditLogs(limit = 50): Promise<any[]> {
    const { data } = await supabase
      .from('admin_audit_log' as any)
      .select('*, profiles:user_id (full_name, email)')
      .order('created_at', { ascending: false })
      .limit(limit);
    return data || [];
  }

  async logAdminAction(action: string, resourceType: string, resourceId?: string, details?: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('admin_audit_log' as any).insert({
      user_id: user.id,
      action,
      resource_type: resourceType,
      resource_id: resourceId,
      details: details || {}
    });
  }

  async getActiveSessions(): Promise<AdminSession[]> {
    const { data } = await supabase.from('admin_sessions' as any).select('*').eq('is_active', true);
    return (data as any[] || []);
  }

  async getModerationQueue(): Promise<ModerationQueueItem[]> {
    const { data } = await supabase.from('blog_posts').select('*').eq('status', 'draft');
    return (data || []).map(p => ({ id: p.id, type: 'blog_post', title: p.title, author: p.author || 'Member', created_at: p.created_at, status: p.status, content_preview: p.content?.substring(0, 100) || '' }));
  }
}

export const adminService = new AdminService();
