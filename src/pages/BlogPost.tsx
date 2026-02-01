
import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import { BlogPost, blogService } from '@/services/blogService';
import { ReadOtherPosts } from '@/components/blog/ReadOtherPosts';
import { BlogSidebar } from '@/components/blog/BlogSidebar';
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
import { supabase } from '@/integrations/supabase/client';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [sending, setSending] = useState(false);
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

    const currentUrl = window.location.href;
    const shareData = {
      title: post.title,
      text: post.excerpt || 'Check out this blog post on CEKA',
      url: currentUrl
    };

    // Try native sharing first (mobile devices)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({
          title: "Shared Successfully",
          description: "Post shared successfully!"
        });
        return;
      } catch (error) {
        console.log('Native share cancelled or failed:', error);
      }
    }

    // Fallback to copying link
    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({
        title: "Link Copied",
        description: "Post link copied to clipboard"
      });
    } catch (error) {
      // Final fallback - show share options
      const shareText = `Check out this post: ${post.title} - ${currentUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;

      // Open WhatsApp as primary fallback
      window.open(whatsappUrl, '_blank', 'width=600,height=400');

      toast({
        title: "Share Options",
        description: "Opening WhatsApp to share. Link also copied to clipboard."
      });
    }
  };

  const handleReply = () => {
    setShowReplyForm(!showReplyForm);
  };

  const submitReply = async () => {
    if (!replyText.trim() || !session?.user || sending) {
      toast({
        title: "Registration Required",
        description: "Please sign in to contribute to the assembly.",
        variant: "destructive"
      });
      return;
    }

    try {
      setSending(true);

      // Social Logic Sync: Post directly to Chat Messages (Bunge Square)
      const { error } = await supabase.from('chat_messages').insert({
        user_id: session.user.id,
        room_id: 'general',
        content: `[Article Discourse: ${post?.title}] ${replyText.trim()}`
      });

      if (error) throw error;

      toast({
        title: "Discourse Synced",
        description: "Your contribution is now live in Bunge Square!"
      });
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Sync Error:', error);
      toast({
        title: "Sync Failed",
        description: "We couldn't reach the assembly. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSending(false);
    }
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
      <div className="container px-4 md:px-6 py-8 pb-16 overflow-x-hidden max-w-full">
        <Button variant="ghost" className="mb-6" asChild>
          <Link to="/blog" className="flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 min-w-0">
            <article className="max-w-4xl break-words overflow-hidden">
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

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold mb-4 leading-tight break-words">
                  {post.title}
                </h1>

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

              <div className="prose prose-lg dark:prose-invert max-w-none mb-8 break-words overflow-x-hidden">
                <div className="whitespace-pre-wrap break-words">{post.content}</div>
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
                      asChild
                      className="hover:text-primary font-bold gap-2 bg-primary/5 rounded-xl px-4"
                    >
                      <Link to={`/community?tab=chat&room=general&source=${post.id}&title=${encodeURIComponent(post.title)}`}>
                        <MessageCircle className="h-4 w-4" />
                        Discuss in Assembly
                      </Link>
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

            {/* Read Other Posts Section */}
            <div className="mt-12 pt-8 border-t">
              <ReadOtherPosts currentPostId={post.id} limit={4} />
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <BlogSidebar />
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPostPage;
