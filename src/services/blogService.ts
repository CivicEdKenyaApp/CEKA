
import localforage from 'localforage';
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  publishedAt: string;
  updatedAt: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  syncStatus: 'pending' | 'synced' | 'error' | 'local-only';
  isOfflineAvailable: boolean;
  priority: 'high' | 'medium' | 'low';
}

class BlogService {
  private localDB: LocalForage;

  constructor() {
    this.localDB = localforage.createInstance({
      name: 'CEKA-Blog',
      storeName: 'posts'
    });
  }

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    const post: BlogPost = {
      ...postData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending',
      isOfflineAvailable: false,
      priority: 'medium'
    } as BlogPost;
    
    await this.localDB.setItem(post.id, post);
    this.queueForSync(post);
    return post;
  }

  async getAllPosts(): Promise<BlogPost[]> {
    const keys = await this.localDB.keys();
    const posts = await Promise.all(
      keys.map(key => this.localDB.getItem(key))
    );
    return (posts.filter(Boolean) as BlogPost[]).sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    const posts = await this.getAllPosts();
    return posts.find(post => post.slug === slug) || null;
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    return await this.localDB.getItem(id);
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    const existing = await this.localDB.getItem(id) as BlogPost;
    if (!existing) return null;

    const updated: BlogPost = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
      syncStatus: 'pending'
    };
    
    await this.localDB.setItem(id, updated);
    this.queueForSync(updated);
    return updated;
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      await this.localDB.removeItem(id);
      this.removeFromSyncQueue(id);
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
  }

  private queueForSync(post: BlogPost) {
    const syncQueue = JSON.parse(
      localStorage.getItem('blog-sync-queue') || '[]'
    );
    if (!syncQueue.includes(post.id)) {
      syncQueue.push(post.id);
      localStorage.setItem('blog-sync-queue', JSON.stringify(syncQueue));
    }
  }

  private removeFromSyncQueue(postId: string) {
    const syncQueue = JSON.parse(
      localStorage.getItem('blog-sync-queue') || '[]'
    );
    const updatedQueue = syncQueue.filter((id: string) => id !== postId);
    localStorage.setItem('blog-sync-queue', JSON.stringify(updatedQueue));
  }

  async markForOffline(postId: string): Promise<boolean> {
    const post = await this.getPostById(postId);
    if (!post) return false;

    await this.updatePost(postId, {
      isOfflineAvailable: true,
      priority: 'high'
    });
    return true;
  }

  async getOfflinePosts(): Promise<BlogPost[]> {
    const allPosts = await this.getAllPosts();
    return allPosts.filter(post => post.isOfflineAvailable);
  }

  generateSlug(title: string): string {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
}

export const blogService = new BlogService();
