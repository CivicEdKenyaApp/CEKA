
import { supabase } from '@/integrations/supabase/client';
import type { RealtimeChannel } from '@supabase/supabase-js';

// Notification source types matching the database schema
export type NotificationSourceType =
  | 'chat_message'
  | 'chat_mention'
  | 'chat_reply'
  | 'blog_comment'
  | 'blog_mention'
  | 'volunteer_opportunity'
  | 'volunteer_application'
  | 'bill_update'
  | 'campaign_update'
  | 'discussion_reply'
  | 'system'
  | 'moderation';

export type NotificationPriority = 'low' | 'normal' | 'high' | 'urgent';

export interface Notification {
  id: string;
  user_id: string;
  source_type: NotificationSourceType;
  source_id: string | null;
  actor_id: string | null;
  title: string;
  message: string;
  link: string | null;
  image_url: string | null;
  metadata: Record<string, unknown>;
  priority: NotificationPriority;
  category: string;
  is_read: boolean;
  read_at: string | null;
  is_archived: boolean;
  archived_at: string | null;
  is_dismissed: boolean;
  created_at: string;
  expires_at: string | null;
  // Joined data
  actor?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

export interface NotificationFilters {
  isRead?: boolean;
  sourceType?: NotificationSourceType;
  priority?: NotificationPriority;
  category?: string;
  limit?: number;
}

class NotificationService {
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;

  /**
   * Get notifications with optional filtering
   * Gracefully handles missing table (migration not yet run)
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // First, try simple query to check if table exists
      let query = supabase
        .from('user_notifications')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_archived', false)
        .order('created_at', { ascending: false });

      if (filters.isRead !== undefined) {
        query = query.eq('is_read', filters.isRead);
      }
      if (filters.sourceType) {
        query = query.eq('source_type', filters.sourceType);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.limit) {
        query = query.limit(filters.limit);
      }

      const { data, error } = await query;

      // Handle table not existing (404) or other errors
      if (error) {
        // Silent fail for missing table - migration not run yet
        if (error.code === '42P01' || error.message?.includes('does not exist') ||
          error.code === 'PGRST116' || error.code === 'PGRST200') {
          console.warn('Notifications table not ready:', error.message);
          return [];
        }
        console.error('Error fetching notifications:', error);
        return [];
      }

      return (data || []) as Notification[];
    } catch (err) {
      console.warn('Notification service error:', err);
      return [];
    }
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return 0;

      const { count, error } = await supabase
        .from('user_notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('is_read', false)
        .eq('is_archived', false);

      if (error) {
        // Silent fail for missing table
        if (error.code === '42P01' || error.message?.includes('does not exist') ||
          error.code === 'PGRST116') {
          return 0;
        }
        console.warn('Error getting unread count:', error);
        return 0;
      }

      return count || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Mark a single notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    try {
      await supabase
        .from('user_notifications')
        .update({ is_read: true, read_at: new Date().toISOString() })
        .eq('id', notificationId);
    } catch (err) {
      console.warn('Error marking notification as read:', err);
    }
  }

  /**
   * Mark multiple notifications as read
   */
  async markMultipleAsRead(notificationIds: string[]): Promise<void> {
    try {
      await supabase.rpc('mark_notifications_read', {
        p_notification_ids: notificationIds
      });
    } catch (err) {
      console.warn('Error marking notifications as read:', err);
    }
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    try {
      await supabase.rpc('mark_all_notifications_read');
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  }

  /**
   * Archive a notification (soft delete)
   */
  async archive(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_archived: true, archived_at: new Date().toISOString() })
      .eq('id', notificationId);

    if (error) {
      console.error('Error archiving notification:', error);
      throw error;
    }
  }

  /**
   * Dismiss a notification (hide without archiving)
   */
  async dismiss(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('user_notifications')
      .update({ is_dismissed: true })
      .eq('id', notificationId);

    if (error) {
      console.error('Error dismissing notification:', error);
      throw error;
    }
  }

  /**
   * Create a notification (for testing or manual triggers)
   */
  async create(
    userId: string,
    sourceType: NotificationSourceType,
    title: string,
    message: string,
    options: {
      sourceId?: string;
      actorId?: string;
      link?: string;
      imageUrl?: string;
      priority?: NotificationPriority;
      metadata?: Record<string, unknown>;
    } = {}
  ): Promise<string | null> {
    const { data, error } = await supabase
      .from('user_notifications')
      .insert({
        user_id: userId,
        source_type: sourceType,
        source_id: options.sourceId,
        actor_id: options.actorId,
        title,
        message,
        link: options.link,
        image_url: options.imageUrl,
        priority: options.priority || 'normal',
        metadata: options.metadata || {},
      })
      .select('id')
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return data?.id || null;
  }

  /**
   * Subscribe to real-time notifications
   * Note: Subscription will silently fail if table doesn't exist
   */
  subscribeToNotifications(
    callback: (notification: Notification) => void
  ): () => void {
    const setupSubscription = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        this.userId = user.id;

        // Remove existing channel if any
        if (this.channel) {
          await supabase.removeChannel(this.channel);
        }

        // Create new channel with user-specific filter
        this.channel = supabase
          .channel(`user_notifications:${user.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_notifications',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              try {
                // Fetch full notification without FK join
                const { data } = await supabase
                  .from('user_notifications')
                  .select('*')
                  .eq('id', payload.new.id)
                  .single();

                if (data) {
                  callback(data as Notification);
                }
              } catch {
                // Silently fail
              }
            }
          )
          .subscribe((status) => {
            if (status === 'CHANNEL_ERROR') {
              console.warn('Notification subscription failed - table may not exist');
            }
          });
      } catch (err) {
        console.warn('Failed to setup notification subscription:', err);
      }
    };

    setupSubscription();

    // Return cleanup function
    return () => {
      if (this.channel) {
        supabase.removeChannel(this.channel);
        this.channel = null;
      }

    };
  }

  /**
   * Get icon based on notification type
   */
  getNotificationIcon(sourceType: NotificationSourceType): string {
    switch (sourceType) {
      case 'chat_message':
      case 'chat_mention':
      case 'chat_reply':
        return 'MessageSquare';
      case 'blog_comment':
      case 'blog_mention':
        return 'PenTool';
      case 'volunteer_opportunity':
      case 'volunteer_application':
        return 'Heart';
      case 'bill_update':
        return 'FileText';
      case 'campaign_update':
        return 'TrendingUp';
      case 'discussion_reply':
        return 'MessageCircle';
      case 'moderation':
        return 'Shield';
      case 'system':
      default:
        return 'Bell';
    }
  }

  /**
   * Get color based on priority
   */
  getPriorityColor(priority: NotificationPriority): string {
    switch (priority) {
      case 'urgent':
        return 'text-red-500';
      case 'high':
        return 'text-amber-500';
      case 'normal':
        return 'text-primary';
      case 'low':
      default:
        return 'text-muted-foreground';
    }
  }
}

export const notificationService = new NotificationService();
export default notificationService;

