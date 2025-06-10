
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { blogService, BlogPost } from '@/services/blogService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, User, ArrowLeft, Heart, Share2, MessageCircle } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) return;
      
      try {
        setLoading(true);
        const postData = await blogService.getPostBySlug(slug);
        setPost(postData);
      } catch (error) {
        console.error('Error loading post:', error);
        toast({
          title: "Error",
          description: "Failed to load blog post",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, toast]);

  const handleLike = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Feature Coming Soon",
      description: "Like functionality will be available soon!"
    });
  };

  const handleShare = async () => {
    if (!post) return;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.href
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Post link copied to clipboard"
        });
      } catch (error) {
        toast({
          title: "Share Failed",
          description: "Unable to share post",
          variant: "destructive"
        });
      }
    }
  };

  const handleReply = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to reply to posts",
        variant: "destructive"
      });
      return;
    }
    toast({
      title: "Feature Coming Soon",
      description: "Reply functionality will be available soon!"
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Loading post...</div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Post Not Found</h1>
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist.</p>
            <Button asChild>
              <Link to="/blog">Back to Blog</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/blog" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <article className="max-w-4xl mx-auto">
          <header className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status}
              </Badge>
              {post.tags && post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-4">{post.title}</h1>
            
            {post.excerpt && (
              <p className="text-lg text-muted-foreground mb-6">{post.excerpt}</p>
            )}
            
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                {new Date(post.published_at || post.created_at).toLocaleDateString()}
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>

          <footer className="border-t pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLike}
                  className="text-muted-foreground hover:text-kenya-green"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Like
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="text-muted-foreground hover:text-kenya-green"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReply}
                  className="text-muted-foreground hover:text-kenya-green"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>
            </div>
          </footer>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPostPage;
