
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
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User, ArrowLeft, Heart, Share2, MessageCircle, Bookmark, Send, Eye, Clock, MessageSquare } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useViewTracking } from '@/hooks/useViewTracking';
import { useViewCount } from '@/hooks/useViewCount';
import { supabase } from '@/integrations/supabase/client';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, translate } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const { language } = useLanguage();
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

    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        toast({ title: "Shared Successfully", description: "Post shared successfully!" });
        return;
      } catch (error) {
        console.log('Native share failed:', error);
      }
    }

    try {
      await navigator.clipboard.writeText(currentUrl);
      toast({ title: "Link Copied", description: "Post link copied to clipboard" });
    } catch (error) {
      const shareText = `Check out this post: ${post.title} - ${currentUrl}`;
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank', 'width=600,height=400');
    }
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
      const { error } = await supabase.from('chat_messages').insert({
        user_id: session.user.id,
        room_id: 'general',
        content: `[Article Discourse: ${post?.title}] ${replyText.trim()}`
      });
      if (error) throw error;
      toast({ title: "Discourse Synced", description: "Your contribution is now live in Bunge Square!" });
      setReplyText('');
      setShowReplyForm(false);
    } catch (error) {
      console.error('Sync Error:', error);
      toast({ title: "Sync Failed", description: "Submission failed. Please try again.", variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const getAuthorInitials = (author?: string) => {
    if (!author) return '?';
    return author.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen bg-white dark:bg-black pt-24">
          <div className="container px-4 space-y-8 animate-pulse">
            <div className="h-8 w-32 bg-slate-100 dark:bg-white/5 rounded-full" />
            <div className="h-20 w-3/4 bg-slate-100 dark:bg-white/5 rounded-3xl" />
            <div className="h-[400px] w-full bg-slate-100 dark:bg-white/5 rounded-[40px]" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="h-20 w-20 rounded-full bg-kenya-red/5 flex items-center justify-center mx-auto">
              <MessageCircle className="h-10 w-10 text-kenya-red opacity-40" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Article Missing</h1>
            <p className="text-slate-500">The requested blog post could not be found in our records.</p>
            <Button asChild className="rounded-2xl h-12 px-8 bg-kenya-green font-bold">
              <Link to="/blog">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-slate-50/30 dark:bg-black">
        {/* HERO SECTION */}
        <section className="relative pt-24 pb-16 overflow-hidden">
          <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/20 backdrop-blur-3xl -z-10" />
          <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-kenya-red/5 to-transparent -z-10" />

          <div className="container relative px-4 text-center max-w-5xl">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <Link to="/blog" className="inline-flex items-center gap-2 text-slate-400 hover:text-kenya-red font-bold text-xs uppercase tracking-widest transition-colors mb-8 group">
                <div className="h-8 w-8 rounded-full bg-white dark:bg-white/5 flex items-center justify-center shadow-sm group-hover:-translate-x-1 transition-transform">
                  <ArrowLeft className="h-4 w-4" />
                </div>
                The Assembly Blog
              </Link>

              <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
                <Badge className="bg-kenya-red/10 text-kenya-red border-kenya-red/20 font-bold px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                  {post.status}
                </Badge>
                {post.tags?.map(tag => (
                  <Badge key={tag} variant="outline" className="bg-white dark:bg-white/5 text-slate-500 font-bold border-black/5 dark:border-white/10 px-4 py-1.5 rounded-full text-[10px] uppercase tracking-widest">
                    {tag}
                  </Badge>
                ))}
              </div>

              <h1 className="text-4xl md:text-7xl font-black tracking-tighter leading-[1.05] text-slate-900 dark:text-white mb-8">
                {post.title}
              </h1>

              <div className="flex flex-wrap items-center justify-center gap-6 text-slate-500 dark:text-slate-400 font-bold text-xs uppercase tracking-widest">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-900 shadow-sm">
                    <AvatarFallback className="bg-kenya-green text-white text-[10px]">
                      {getAuthorInitials(post.author)}
                    </AvatarFallback>
                  </Avatar>
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-kenya-red" />
                  <span>{new Date(post.published_at || post.created_at).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-500" />
                  <span>{viewCount} views</span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <div className="container relative px-4 pb-24 max-w-7xl">
          <div className="grid lg:grid-cols-12 gap-12">

            {/* ARTICLE CONTENT */}
            <article className="lg:col-span-8 bg-white dark:bg-slate-900/40 rounded-[48px] p-8 md:p-16 shadow-ios-soft dark:shadow-none border border-black/5 dark:border-white/10">
              {post.excerpt && (
                <p className="text-2xl md:text-3xl font-medium text-slate-900 dark:text-white mb-12 leading-relaxed tracking-tight italic border-l-4 border-kenya-red pl-8">
                  {post.excerpt}
                </p>
              )}

              <div className="prose prose-xl prose-slate dark:prose-invert max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed">
                  {post.content}
                </div>
              </div>

              <Separator className="my-12 opacity-50" />

              <div className="flex flex-wrap items-center justify-between gap-6">
                <div className="flex items-center gap-3">
                  <Button
                    variant={isLiked ? "default" : "outline"}
                    size="lg"
                    onClick={handleLike}
                    className={cn(
                      "rounded-2xl font-bold h-12 px-6 transition-all",
                      isLiked ? "bg-kenya-red text-white border-kenya-red shadow-lg shadow-kenya-red/20" : "border-black/5 dark:border-white/10"
                    )}
                  >
                    <Heart className={cn("h-5 w-5 mr-2", isLiked && "fill-current")} />
                    {isLiked ? 'Loved' : 'Love'}
                  </Button>

                  <Button
                    variant="outline"
                    size="lg"
                    onClick={handleShare}
                    className="rounded-2xl font-bold h-12 px-6 border-black/5 dark:border-white/10"
                  >
                    <Share2 className="h-5 w-5 mr-2" />
                    Share
                  </Button>

                  <Button
                    variant={isSaved ? "default" : "outline"}
                    size="lg"
                    onClick={handleSave}
                    className={cn(
                      "rounded-2xl font-bold h-12 px-6 transition-all",
                      isSaved ? "bg-kenya-green text-white border-kenya-green shadow-lg shadow-kenya-green/20" : "border-black/5 dark:border-white/10"
                    )}
                  >
                    <Bookmark className={cn("h-5 w-5 mr-2", isSaved && "fill-current")} />
                    {isSaved ? 'Saved' : 'Save'}
                  </Button>
                </div>

                <Button
                  onClick={() => setShowReplyForm(!showReplyForm)}
                  className="rounded-2xl h-12 px-8 bg-[#111] dark:bg-white text-white dark:text-black font-black text-xs uppercase tracking-widest shadow-xl"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Discuss
                </Button>
              </div>

              <AnimatePresence>
                {showReplyForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-8 overflow-hidden"
                  >
                    <Card className="rounded-3xl border-dashed border-2 border-kenya-green/20 bg-kenya-green/[0.02]">
                      <CardContent className="pt-8">
                        <div className="space-y-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 ring-2 ring-white shadow-md">
                              <AvatarFallback className="bg-slate-100 text-[10px] font-black">
                                {session?.user?.email?.charAt(0).toUpperCase() || 'A'}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-xs font-black uppercase tracking-widest text-slate-400">Contributing as</p>
                              <p className="text-sm font-bold">{session?.user?.email || 'Anonymous Guest'}</p>
                            </div>
                          </div>

                          <Textarea
                            placeholder={session ? "Contribute to the collective wisdom..." : "Authentication required for assembly discourse."}
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                            className="min-h-[150px] rounded-2xl bg-white border-black/5 focus:ring-kenya-green/20 resize-none text-lg"
                          />

                          <div className="flex justify-between items-center">
                            <p className="text-xs text-slate-400">Submission will be indexed in Bunge Square.</p>
                            <div className="flex gap-3">
                              <Button variant="ghost" onClick={() => setShowReplyForm(false)} className="rounded-xl font-bold">Cancel</Button>
                              <Button
                                onClick={submitReply}
                                disabled={!session || !replyText.trim() || sending}
                                className="rounded-xl bg-kenya-green text-white font-bold h-11 px-6 shadow-lg shadow-kenya-green/20"
                              >
                                {sending ? 'Syncing...' : 'Sync Discourse'}
                                <Send className="h-4 w-4 ml-2" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Related Posts */}
              <div className="mt-20 pt-12 border-t border-black/5 dark:border-white/10">
                <ReadOtherPosts currentPostId={post.id} limit={4} />
              </div>
            </article>

            {/* SIDEBAR */}
            <aside className="lg:col-span-4 min-w-0">
              <div className="sticky top-24 space-y-8">
                <div className="bg-white/70 dark:bg-slate-900/40 backdrop-blur-xl rounded-[40px] p-8 border border-black/5 dark:border-white/10 shadow-ios-soft">
                  <BlogSidebar />
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogPostPage;
