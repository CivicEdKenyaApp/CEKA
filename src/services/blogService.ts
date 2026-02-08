
import { supabase } from '@/integrations/supabase/client';

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  content_type?: 'html' | 'markdown';
  excerpt?: string;
  author?: string;
  tags?: string[];
  status: 'draft' | 'published' | 'archived';
  user_id?: string;
  category_id?: string;
  published_at?: string;
  created_at: string;
  updated_at: string;
  scheduled_at?: string;
  admin_notes?: string;
  rejection_reason?: string;
  meta_description?: string;
  featured_image_url?: string;
  reading_time?: number;
  word_count?: number;
  seo_keywords?: string[];
  revision_number?: number;
  views?: number;
}

export interface BlogMedia {
  id: string;
  user_id: string;
  blog_post_id?: string;
  file_name: string;
  file_url: string;
  file_type: string;
  file_size: number;
  alt_text?: string;
  caption?: string;
  created_at: string;
  updated_at: string;
}

export interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  color?: string;
  created_at: string;
}

export interface BlogTag {
  id: string;
  name: string;
  slug: string;
  description?: string;
  created_at: string;
}

class BlogService {
  async getPublishedPosts(limit?: number): Promise<BlogPost[]> {
    try {
      let query = supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) throw error;
      return (data || []).map(post => ({
        ...post,
        status: post.status as 'draft' | 'published' | 'archived'
      }));
    } catch (error) {
      console.error('Error fetching published posts:', error);
      return [];
    }
  }

  async getPostBySlug(slug: string): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug)
        .eq('status', 'published')
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        status: data.status as 'draft' | 'published' | 'archived'
      } : null;
    } catch (error) {
      console.error('Error fetching post by slug:', error);
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
        status: data.status as 'draft' | 'published' | 'archived'
      } : null;
    } catch (error) {
      console.error('Error fetching post by id:', error);
      return null;
    }
  }

  async getFeaturedPosts(limit: number = 2): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('status', 'published')
        .order('published_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return (data || []).map(post => ({
        ...post,
        status: post.status as 'draft' | 'published' | 'archived'
      }));
    } catch (error) {
      console.error('Error fetching featured posts:', error);
      return [];
    }
  }

  async createPost(post: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const postData = {
        title: post.title || '',
        slug: post.slug || '',
        content: post.content || '',
        content_type: post.content_type || 'html',
        excerpt: post.excerpt,
        author: post.author,
        tags: post.tags,
        status: post.status || 'draft',
        user_id: post.user_id,
        category_id: post.category_id,
        published_at: post.published_at,
        scheduled_at: post.scheduled_at,
        meta_description: post.meta_description,
        featured_image_url: post.featured_image_url,
        seo_keywords: post.seo_keywords,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('blog_posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        status: data.status as 'draft' | 'published' | 'archived'
      } : null;
    } catch (error) {
      console.error('Error creating post:', error);
      return null;
    }
  }

  async updatePost(id: string, updates: Partial<BlogPost>): Promise<BlogPost | null> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data ? {
        ...data,
        status: data.status as 'draft' | 'published' | 'archived'
      } : null;
    } catch (error) {
      console.error('Error updating post:', error);
      return null;
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
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  async getAllPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []).map(post => ({
        ...post,
        status: post.status as 'draft' | 'published' | 'archived'
      }));
    } catch (error) {
      console.error('Error fetching all posts:', error);
      return [];
    }
  }

  // Media management methods
  async uploadMedia(file: File, postId?: string): Promise<BlogMedia | null> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('blog-media')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('blog-media')
        .getPublicUrl(filePath);

      // Since blog_media table doesn't exist in types yet, we'll create a mock response
      // This should be updated once the database types are regenerated
      const mediaData: BlogMedia = {
        id: crypto.randomUUID(),
        user_id: 'current-user-id', // This should be replaced with actual user ID
        blog_post_id: postId,
        file_name: file.name,
        file_url: publicUrl,
        file_type: file.type,
        file_size: file.size,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return mediaData;
    } catch (error) {
      console.error('Error uploading media:', error);
      return null;
    }
  }

  async getCategories(): Promise<BlogCategory[]> {
    try {
      const { data, error } = await supabase
        .from('blog_categories')
        .select('*')
        .order('name');

      if (error) throw error;

      // Map the data to include slug since it's missing from the database
      return (data || []).map(category => ({
        id: category.id,
        name: category.name,
        slug: this.generateSlug(category.name),
        description: category.description,
        color: '#6366f1', // Default color since it's not in the current schema
        created_at: category.created_at
      }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async getTags(): Promise<BlogTag[]> {
    try {
      // Since blog_tags table doesn't exist in types yet, return empty array
      // This should be updated once the database types are regenerated
      console.log('getTags: blog_tags table not available in current schema');
      return [];
    } catch (error) {
      console.error('Error fetching tags:', error);
      return [];
    }
  }
}

export const blogService = new BlogService();
