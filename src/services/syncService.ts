
import { blogService, BlogPost } from './blogService';
import { supabase } from '@/integrations/supabase/client';

class SyncService {
  private isOnline: boolean;
  private syncInProgress: boolean = false;

  constructor() {
    this.isOnline = navigator.onLine;
    this.setupEventListeners();
  }

  private setupEventListeners() {
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.syncPendingPosts();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Sync when page becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncPendingPosts();
      }
    });
  }

  async syncPendingPosts(): Promise<void> {
    if (!this.isOnline || this.syncInProgress) return;

    this.syncInProgress = true;
    const syncQueue = JSON.parse(
      localStorage.getItem('blog-sync-queue') || '[]'
    );

    for (const postId of syncQueue) {
      try {
        const post = await blogService.getPostById(postId);
        if (!post) continue;

        await this.syncToSupabase(post);
        
        // Update sync status
        await blogService.updatePost(postId, {
          syncStatus: 'synced'
        });
        
        // Remove from queue
        this.removeFromSyncQueue(postId);
      } catch (error) {
        console.error('Sync failed for post:', postId, error);
        await blogService.updatePost(postId, {
          syncStatus: 'error'
        });
      }
    }
    
    this.syncInProgress = false;
  }

  private async syncToSupabase(post: BlogPost): Promise<void> {
    // Since we don't have a blog_posts table yet, we'll prepare for when it's created
    // For now, we'll just simulate successful sync
    console.log('Would sync to Supabase:', post.title);
    
    // Future implementation:
    // const { data, error } = await supabase
    //   .from('blog_posts')
    //   .upsert(post);
    // 
    // if (error) throw error;
  }

  private removeFromSyncQueue(postId: string) {
    const syncQueue = JSON.parse(
      localStorage.getItem('blog-sync-queue') || '[]'
    );
    const updatedQueue = syncQueue.filter((id: string) => id !== postId);
    localStorage.setItem('blog-sync-queue', JSON.stringify(updatedQueue));
  }

  getConnectionStatus(): boolean {
    return this.isOnline;
  }
}

export const syncService = new SyncService();
