
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

// Type helper for table that doesn't exist in generated types yet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const notificationsTable = () => supabase.from('user_notifications' as any);

class NotificationService {
  private channel: RealtimeChannel | null = null;
  private userId: string | null = null;
  private isSubscribing = false;

  /**
   * Get notifications with optional filtering
   * Gracefully handles missing table (migration not yet run)
   */
  async getNotifications(filters: NotificationFilters = {}): Promise<Notification[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Use type assertion for table that doesn't exist in types.ts yet
      let query = notificationsTable()
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

      return (data || []) as unknown as Notification[];
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

      const { count, error } = await notificationsTable()
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
      await notificationsTable()
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
      await supabase.rpc('mark_notifications_read' as any, {
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
      await supabase.rpc('mark_all_notifications_read' as any);
    } catch (err) {
      console.warn('Error marking all notifications as read:', err);
    }
  }

  /**
   * Archive a notification (soft delete)
   */
  async archive(notificationId: string): Promise<void> {
    const { error } = await notificationsTable()
      .update({ is_archived: true, archived_at: new Date().toISOString() } as any)
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
    const { error } = await notificationsTable()
      .update({ is_dismissed: true } as any)
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
    const { data, error } = await notificationsTable()
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
      } as any)
      .select('id' as any)
      .single();

    if (error) {
      console.error('Error creating notification:', error);
      return null;
    }

    return (data as any)?.id || null;
  }

  subscribeToNotifications(
    callback: (notification: Notification) => void
  ): () => void {
    let active = true;

    const setupSubscription = async () => {
      if (this.isSubscribing) return;
      this.isSubscribing = true;

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !active) {
          this.isSubscribing = false;
          return;
        }

        this.userId = user.id;

        // Clean removal of previous channel
        if (this.channel) {
          const oldChannel = this.channel;
          this.channel = null;
          try {
            // Properly await unsubscription and removal
            await oldChannel.unsubscribe();
            await supabase.removeChannel(oldChannel);
          } catch (e) {
            // Ignore abort/removal errors
          }
        }

        if (!active) {
          this.isSubscribing = false;
          return;
        }

        // Create new channel with user-specific filter
        this.channel = supabase
          .channel(`user_notifications:${user.id}-${Math.random().toString(36).substr(2, 9)}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'user_notifications',
              filter: `user_id=eq.${user.id}`,
            },
            async (payload) => {
              if (!active) return;
              try {
                // Fetch the full record with potentially joined profiles (managed in DB trigger)
                const { data, error } = await notificationsTable()
                  .select('*')
                  .eq('id', payload.new.id)
                  .single();

                if (error) throw error;
                if (data && active) {
                  callback(data as unknown as Notification);
                }
              } catch (err) {
                console.warn('Notification fetch error:', err);
              }
            }
          )
          .subscribe(async (status) => {
            if (status === 'CHANNEL_ERROR' && active) {
              console.warn('Notification subscription failed');
            }
            if (status === 'SUBSCRIBED' && !active) {
              // If we unmounted while subscribing, clean up immediately
              if (this.channel) {
                const chan = this.channel;
                this.channel = null;
                await chan.unsubscribe();
                await supabase.removeChannel(chan);
              }
            }
          });
      } catch (err) {
        if (active) console.warn('Failed to setup notification subscription:', err);
      } finally {
        this.isSubscribing = false;
      }
    };

    setupSubscription();

    // Return cleanup function
    return () => {
      active = false;

      // Immediate state cleanup
      const currentChannel = this.channel;
      this.channel = null;

      if (currentChannel) {
        // Asynchronous cleanup to prevent blocking the unmount
        (async () => {
          try {
            // Check established state indirectly via presence or standard check
            // If the channel is joining or joined, we unsubscribe
            const state = currentChannel.state;
            if (state === 'joined' || state === 'joining') {
              await currentChannel.unsubscribe();
            }
            // Always attempt removal to clean up the Supabase client's internal references
            await supabase.removeChannel(currentChannel);
          } catch (e) {
            // Persistent cleanup even on transient errors - log as info not warn
            console.debug('Channel cleanup handled:', e);
          }
        })();
      }
    };
  }

  /**
   * Generates a thumbnail for media without one
   */
  async getAutoThumbnail(url: string, type: string): Promise<string | null> {
    if (type === 'video') {
      return new Promise((resolve) => {
        const video = document.createElement('video');
        video.src = url;
        video.crossOrigin = 'anonymous';
        video.currentTime = 1;
        video.muted = true;

        video.onloadeddata = () => {
          const canvas = document.createElement('canvas');
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.7));
        };

        video.onerror = () => resolve(null);
        // Timeout safeguard
        setTimeout(() => resolve(null), 5000);
      });
    }
    return null;
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

