
import React, { useState, useEffect } from 'react';
import { MessageSquare, ArrowRight, Users, ThumbsUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { blogService, BlogPost } from '@/services/blogService';

const CommunitySection = () => {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

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
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays === 1) return '1 day ago';
    if (diffInDays < 7) return `${diffInDays} days ago`;
    
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <section className="section-padding">
        <div className="container">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-2">Blog Discussions</h2>
              <p className="text-muted-foreground">Join conversations on civic issues affecting Kenyans</p>
            </div>
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            {[1, 2].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="section-padding">
      <div className="container">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Blog Discussions</h2>
            <p className="text-muted-foreground">Join conversations on civic issues affecting Kenyans</p>
          </div>
          <Button asChild variant="ghost" className="mt-4 md:mt-0">
            <Link to="/blog" className="flex items-center">
              View all posts
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
        
        {blogPosts.length === 0 ? (
          <div className="text-center py-12">
            <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No blog posts yet</h3>
            <p className="text-muted-foreground mb-4">Be the first to start a discussion on important civic issues.</p>
            <Button asChild>
              <Link to="/blog">Create a post</Link>
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-6">
            {blogPosts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <Badge variant="outline" className="bg-muted font-normal">
                      Blog Post
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {getTimeAgo(post.published_at || post.created_at)}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg mt-2">
                    <Link to={`/blog/${post.slug}`} className="hover:text-kenya-green transition-colors">
                      {post.title}
                    </Link>
                  </h3>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-2">
                    {post.excerpt || post.content.substring(0, 200) + '...'}
                  </p>
                  
                  <div className="flex items-center mt-4 space-x-2">
                    <Avatar className="h-6 w-6">
                      <AvatarFallback className="text-xs">
                        {getAuthorInitials(post.author)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium">{post.author || 'Anonymous'}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between text-xs text-muted-foreground border-t">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>0 replies</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <ThumbsUp className="h-3.5 w-3.5" />
                      <span>0 likes</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link to={`/blog/${post.slug}`}>
                      Read more
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        
        <div className="mt-10 py-8 px-6 rounded-lg bg-gradient-to-r from-kenya-green/10 to-kenya-red/10 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <Users className="h-12 w-12 mx-auto text-kenya-green" />
            <h3 className="text-xl font-bold">Join Our Blog</h3>
            <p className="text-muted-foreground">
              Connect with like-minded citizens passionate about civic education and making a difference in Kenya.
            </p>
            <Button asChild className="mt-2 bg-kenya-green hover:bg-kenya-green/90">
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
