
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, Clock } from 'lucide-react';
import { BlogPost, blogService } from '@/services/blogService';

interface ReadOtherPostsProps {
  currentPostId: string;
  limit?: number;
}

export function ReadOtherPosts({ currentPostId, limit = 3 }: ReadOtherPostsProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadOtherPosts = async () => {
      try {
        const allPosts = await blogService.getPublishedPosts();
        const otherPosts = allPosts
          .filter(post => post.id !== currentPostId)
          .slice(0, limit);
        setPosts(otherPosts);
      } catch (error) {
        console.error('Error loading other posts:', error);
      } finally {
        setLoading(false);
      }
    };

    loadOtherPosts();
  }, [currentPostId, limit]);

  if (loading) {
    return (
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Read Other Posts</h3>
        <div className="grid gap-4">
          {Array.from({ length: limit }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-12 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-xl font-semibold mb-2">No Other Posts Available</h3>
        <p className="text-muted-foreground mb-4">Be the first to explore more content!</p>
        <Button asChild>
          <Link to="/blog">Browse All Posts</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold">Read Other Posts</h3>
        <Button variant="ghost" size="sm" asChild>
          <Link to="/blog" className="flex items-center">
            View All <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 min-w-0">
        {posts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow overflow-hidden break-words">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-lg leading-tight mb-2">
                    <Link
                      to={`/blog/${post.slug}`}
                      className="hover:text-kenya-green transition-colors line-clamp-2"
                    >
                      {post.title}
                    </Link>
                  </CardTitle>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {post.author}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {new Date(post.published_at || post.created_at).toLocaleDateString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {post.reading_time || 5} min read
                    </div>
                  </div>
                </div>

                <Badge variant="secondary" className="text-xs">
                  {post.status}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {post.excerpt || post.content.slice(0, 120) + '...'}
              </p>

              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-3">
                  {post.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              )}

              <Button variant="ghost" size="sm" className="text-kenya-green hover:text-kenya-green/90 p-0 h-auto">
                <Link to={`/blog/${post.slug}`} className="flex items-center">
                  Read More <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
