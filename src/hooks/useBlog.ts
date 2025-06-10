import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/providers/AuthProvider';
import { BlogPost, blogService } from '@/services/blogService';

export function useBlog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const loadPosts = async () => {
    try {
      setLoading(true);
      const allPosts = await blogService.getAllPosts();
      setPosts(allPosts);
      setError(null);
    } catch (err) {
      setError('Failed to load posts');
      console.error('Error loading posts:', err);
    } finally {
      setLoading(false);
    }
  };

  const createPost = async (postData: Partial<BlogPost>) => {
    try {
      const newPost = await blogService.createPost({
        ...postData,
        author: user?.email || 'Anonymous'
      });
      setPosts(prev => [newPost, ...prev]);
      return newPost;
    } catch (err) {
      setError('Failed to create post');
      throw err;
    }
  };

  const updatePost = async (id: string, updates: Partial<BlogPost>) => {
    try {
      const updatedPost = await blogService.updatePost(id, updates);
      if (updatedPost) {
        setPosts(prev => prev.map(post => 
          post.id === id ? updatedPost : post
        ));
      }
      return updatedPost;
    } catch (err) {
      setError('Failed to update post');
      throw err;
    }
  };

  const deletePost = async (id: string) => {
    try {
      await blogService.deletePost(id);
      setPosts(prev => prev.filter(post => post.id !== id));
    } catch (err) {
      setError('Failed to delete post');
      throw err;
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  return {
    posts,
    loading,
    error,
    loadPosts,
    createPost,
    updatePost,
    deletePost
  };
}
