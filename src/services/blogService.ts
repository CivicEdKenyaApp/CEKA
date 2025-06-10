
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  author: string;
  published_at: string;
  created_at: string;
  updated_at: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
}

class BlogService {
  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });

      if (error) throw error;
      
      return (data || []).map(post => ({
        ...post,
        published_at: post.published_at || post.created_at,
        publishedAt: post.published_at || post.created_at // Keep both for compatibility
      }));
    } catch (error) {
      console.error('Error loading posts:', error);
      throw error;
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .single();

      if (error) throw error;
      
      return data ? {
        ...data,
        published_at: data.published_at || data.created_at,
        publishedAt: data.published_at || data.created_at
      } : null;
    } catch (error) {
      console.error('Error loading post:', error);
      return null;
    }
  }

  async getPostById(id: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      
      return data ? {
        ...data,
        published_at: data.published_at || data.created_at,
        publishedAt: data.published_at || data.created_at
      } : null;
    } catch (error) {
      console.error('Error loading post:', error);
      return null;
    }
  }

  async createPost(postData: Partial<BlogPost>): Promise<BlogPost> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .insert({
          title: postData.title,
          slug: postData.slug || this.generateSlug(postData.title || ''),
          content: postData.content,
          excerpt: postData.excerpt,
          author: postData.author,
          tags: postData.tags || [],
          status: postData.status || 'draft',
          published_at: postData.status === 'published' ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (error) throw error;
      
      return {
        ...data,
        published_at: data.published_at || data.created_at,
        publishedAt: data.published_at || data.created_at
      };
    } catch (error) {
      console.error('Error creating post:', error);
      throw error;
    }
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const updateData: any = { ...updates };
      
      if (updates.status === 'published' && !updates.published_at) {
        updateData.published_at = new Date().toISOString();
      }

      const { data, error } = await supabase
        .from('blog_posts')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      return data ? {
        ...data,
        published_at: data.published_at || data.created_at,
        publishedAt: data.published_at || data.created_at
      } : null;
    } catch (error) {
      console.error('Error updating post:', error);
      throw error;
    }
  }

  async deletePost(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting post:', error);
      return false;
    }
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
