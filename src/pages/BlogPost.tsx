
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { blogService, BlogPost } from '@/services/blogService';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, User, ArrowLeft, Heart, Share2, MessageCircle, Bookmark, Send, Eye } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useViewTracking } from '@/hooks/useViewTracking';
import { useViewCount } from '@/hooks/useViewCount';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const { session } = useAuth();
  const { toast } = useToast();

  // Track view for this blog post
  useViewTracking({
    resourceId: post?.id || '',
    resourceType: 'blog_post',
    viewType: 'page_view'
  });

  // Get view count
  const viewCount = useViewCount(post?.id || '', 'blog_post');

  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setLoading(false);
        return;
      }
      
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
    if (!session) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    
    setIsLiked(!isLiked);
    toast({
      title: isLiked ? "Unliked" : "Liked",
      description: isLiked ? "Post unliked" : "Post liked successfully!"
    });
  };

  const handleSave = () => {
    if (!session) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save posts",
        variant: "destructive"
      });
      return;
    }
    
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Unsaved" : "Saved",
      description: isSaved ? "Post removed from saved items" : "Post saved successfully!"
    });
  };

  const handleShare = async () => {
    if (!post) return;
    
    const shareData = {
      title: post.title,
      text: post.excerpt || 'Check out this blog post on CEKA',
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback options
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast({
          title: "Link Copied",
          description: "Post link copied to clipboard"
        });
      } catch (error) {
        // Final fallback - show share options
        const shareText = `Check out this post: ${post.title} - ${window.location.href}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
        
        toast({
          title: "Share Options",
          description: (
            <div className="space-y-2">
              <p>Share this post:</p>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => window.open(whatsappUrl, '_blank')}>
                  WhatsApp
                </Button>
                <Button size="sm" onClick={() => window.open(twitterUrl, '_blank')}>
                  Twitter
                </Button>
                <Button size="sm" onClick={() => window.open(facebookUrl, '_blank')}>
                  Facebook
                </Button>
              </div>
            </div>
          )
        });
      }
    }
  };

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };

  const submitReply = () => {
    if (!replyText.trim()) {
      toast({
        title: "Empty Reply",
        description: "Please enter a reply message",
        variant: "destructive"
      });
      return;
    }

    // For now, just show success - in real implementation, this would save to database
    toast({
      title: "Reply Posted",
      description: "Your reply has been posted successfully!"
    });
    setReplyText('');
    setShowReplyForm(false);
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
            <p className="text-muted-foreground mb-6">The blog post you're looking for doesn't exist or may have been removed.</p>
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
      <div className="container py-8 pb-16">
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
            
            <div className="flex items-center justify-between">
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
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {viewCount} views
              </div>
            </div>
          </header>

          <div className="prose prose-lg max-w-none mb-8">
            <div className="whitespace-pre-wrap">{post.content}</div>
          </div>

          <footer className="border-t pt-6 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  variant={isLiked ? "default" : "ghost"}
                  size="sm"
                  onClick={handleLike}
                  className={isLiked ? "bg-kenya-green hover:bg-kenya-green/90" : "hover:text-kenya-green"}
                >
                  <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
                  Like
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="hover:text-kenya-green"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReply}
                  className="hover:text-kenya-green"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>

                <Button
                  variant={isSaved ? "default" : "ghost"}
                  size="sm"
                  onClick={handleSave}
                  className={isSaved ? "bg-kenya-green hover:bg-kenya-green/90" : "hover:text-kenya-green"}
                >
                  <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
              </div>
            </div>

            {showReplyForm && (
              <Card>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="" alt="You" />
                        <AvatarFallback>
                          {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 space-y-3">
                        <Textarea
                          placeholder={session ? "Write your reply..." : "Sign in to reply (anonymous replies coming soon)"}
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-muted-foreground">
                            {session ? `Replying as ${session.user.email}` : 'Anonymous replies coming soon'}
                          </p>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setShowReplyForm(false)}>
                              Cancel
                            </Button>
                            <Button size="sm" onClick={submitReply} disabled={!session || !replyText.trim()}>
                              <Send className="h-4 w-4 mr-1" />
                              Post Reply
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </footer>
        </article>
      </div>
    </Layout>
  );
};

export default BlogPostPage;
