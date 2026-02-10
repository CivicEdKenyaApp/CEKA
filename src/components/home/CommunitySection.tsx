import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, Users, ThumbsUp, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { blogService, BlogPost } from '@/services/blogService';
import { useLanguage } from '@/contexts/LanguageContext';
import { translate, cn } from '@/lib/utils';
import { motion } from 'framer-motion';

const CommunitySection = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { language } = useLanguage();

  useEffect(() => {
    loadFeaturedPosts();
  }, []);

  const loadFeaturedPosts = async () => {
    try {
      const posts = await blogService.getFeaturedPosts(2);
      setBlogPosts(posts);
    } catch (error) {
      console.error('Error loading featured posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAuthorInitials = (author?: string) => {
    if (!author) return '?';
    return author.split(' ').map(name => name.charAt(0)).join('').toUpperCase();
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return 'Yesterday';
    if (diffInDays < 7) return `${diffInDays}d ago`;

    return date.toLocaleDateString();
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    })
  };

  if (loading) {
    return (
      <section className="py-16 md:py-24 bg-slate-50/30 dark:bg-black/20">
        <div className="container px-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div className="space-y-2">
              <div className="h-4 w-32 bg-slate-200 dark:bg-white/5 rounded-full animate-pulse" />
              <div className="h-10 w-64 bg-slate-200 dark:bg-white/5 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="h-64 rounded-[32px] bg-slate-100 dark:bg-white/5 animate-pulse" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-24 relative overflow-hidden bg-white dark:bg-black">
      <div className="container relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6 px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="space-y-4"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-kenya-red/10 text-kenya-red text-[10px] font-bold uppercase tracking-widest border border-kenya-red/20">
              Assembly Discourse
            </div>
            <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {translate('Blog Discussions', language)}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-lg max-w-xl">
              {translate('Join the conversation on civic issues and governance affecting every Kenyan today.', language)}
            </p>
          </motion.div>
          <Button asChild variant="ghost" className="rounded-full hover:bg-slate-100 dark:hover:bg-white/5 font-bold group">
            <Link to="/blog" className="flex items-center">
              View all posts
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </Button>
        </div>

        {blogPosts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-slate-50/50 dark:bg-white/5 rounded-[40px] border border-dashed border-slate-200 dark:border-white/10">
            <MessageCircle className="h-16 w-16 mx-auto text-slate-300 dark:text-slate-700 mb-6" />
            <h3 className="text-2xl font-bold mb-2">No discussions yet</h3>
            <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">Be the first to start a conversation on important civic issues in the assembly.</p>
            <Button asChild className="rounded-2xl h-12 px-8 bg-kenya-green font-bold shadow-lg shadow-kenya-green/20">
              <Link to="/blog">Create a post</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 px-4">
            {blogPosts.map((post, i) => (
              <motion.div
                key={post.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={cardVariants}
                className="h-full"
              >
                <Card className={cn(
                  "group relative h-full flex flex-col overflow-hidden border-black/5 dark:border-white/10",
                  "bg-white dark:bg-slate-900/40 backdrop-blur-xl shadow-ios-high dark:shadow-ios-high-dark",
                  "transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-[40px]"
                )}>
                  <CardHeader className="pb-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 font-bold border-none rounded-full px-3 py-1 text-[10px] uppercase tracking-wider">
                          Civic Insight
                        </Badge>
                        <time className="text-[11px] font-bold text-slate-400 uppercase tracking-tight">
                          {getTimeAgo(post.published_at || post.created_at)}
                        </time>
                      </div>
                      <div className="flex -space-x-1">
                        {[1, 2, 3].map(j => (
                          <div key={j} className="h-5 w-5 rounded-full border border-white dark:border-slate-900 bg-slate-200 dark:bg-slate-800" />
                        ))}
                      </div>
                    </div>
                    <h3 className="font-extrabold text-2xl tracking-tight leading-tight group-hover:text-kenya-green transition-colors duration-300">
                      <Link to={`/blog/${post.slug}`}>
                        {post.title}
                      </Link>
                    </h3>
                  </CardHeader>
                  <CardContent className="pb-6">
                    <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">
                      {post.excerpt || post.content.substring(0, 200) + '...'}
                    </p>

                    <div className="flex items-center mt-6 p-1 pr-4 bg-slate-50 dark:bg-white/5 rounded-full w-fit border border-black/5 dark:border-white/5">
                      <Avatar className="h-8 w-8 ring-2 ring-white dark:ring-slate-900 shadow-sm">
                        <AvatarFallback className="text-xs font-black bg-kenya-green text-white">
                          {getAuthorInitials(post.author)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-3">{post.author || 'Anonymous'}</span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between items-center py-6 mt-auto border-t border-black/5 dark:border-white/5 px-8">
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-slate-400 group/icon">
                        <MessageSquare className="h-4 w-4 group-hover/icon:text-kenya-green transition-colors" />
                        <span className="text-xs font-bold tracking-tight">0</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-400 group/icon">
                        <ThumbsUp className="h-4 w-4 group-hover/icon:text-kenya-green transition-colors" />
                        <span className="text-xs font-bold tracking-tight">0</span>
                      </div>
                    </div>
                    <Button variant="ghost" className="h-10 rounded-2xl font-black text-xs uppercase tracking-widest text-primary hover:bg-primary/5 group/btn" asChild>
                      <Link to={`/blog/${post.slug}`} className="flex items-center">
                        Open Discourse
                        <ArrowRight className="ml-2 h-3.5 w-3.5 group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </Button>
                  </CardFooter>
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-tr from-kenya-green/5 to-transparent pointer-events-none transition-opacity duration-700" />
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="mt-16 py-12 px-8 rounded-[40px] bg-gradient-to-br from-kenya-green/10 via-white dark:via-black to-kenya-red/10 border border-black/5 dark:border-white/5 text-center shadow-ios-soft">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="h-20 w-20 mx-auto rounded-3xl bg-white dark:bg-white/5 shadow-ios-high flex items-center justify-center">
              <Users className="h-10 w-10 text-kenya-green" />
            </div>
            <h3 className="text-3xl font-extrabold tracking-tight">Join Our Blog</h3>
            <p className="text-slate-500 dark:text-slate-400 text-lg leading-relaxed">
              Connect with like-minded citizens passionate about civic education and making a difference in Kenya.
            </p>
            <Button asChild className="rounded-2xl h-14 px-10 bg-kenya-green hover:bg-kenya-green/90 text-white font-bold shadow-xl shadow-kenya-green/20 text-lg">
              <Link to="/join-community">
                Join Now
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CommunitySection;
