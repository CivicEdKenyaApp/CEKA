
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Tag, Heart, Share2, MessageCircle } from 'lucide-react';
import { BlogPost } from '@/services/blogService';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handleLike = (postId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }
    // TODO: Implement like functionality
    toast({
      title: "Feature Coming Soon",
      description: "Like functionality will be available soon!"
    });
  };

  const handleShare = async (post: BlogPost) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.excerpt,
          url: window.location.origin + `/blog/${post.slug}`
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback: copy to clipboard
      try {
        await navigator.clipboard.writeText(window.location.origin + `/blog/${post.slug}`);
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

  const handleReply = (postId: string) => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to reply to posts",
        variant: "destructive"
      });
      return;
    }
    // TODO: Implement reply functionality
    toast({
      title: "Feature Coming Soon",
      description: "Reply functionality will be available soon!"
    });
  };

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">No posts found</h3>
        <p className="text-muted-foreground">Check back later for new content.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {posts.map((post) => (
        <Card key={post.id} className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1">
                <CardTitle className="text-xl">
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="hover:text-kenya-green transition-colors line-clamp-2"
                  >
                    {post.title}
                  </Link>
                </CardTitle>
                
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {post.author}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(post.published_at || post.created_at).toLocaleDateString()}
                  </div>
                </div>
              </div>
              
              <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                {post.status}
              </Badge>
            </div>
          </CardHeader>
          
          <CardContent>
            <p className="text-muted-foreground mb-4 line-clamp-3">
              {post.excerpt || post.content.slice(0, 200) + '...'}
            </p>
            
            {post.tags && post.tags.length > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-between pt-4 border-t">
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleLike(post.id)}
                  className="text-muted-foreground hover:text-kenya-green"
                >
                  <Heart className="h-4 w-4 mr-1" />
                  Like
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleShare(post)}
                  className="text-muted-foreground hover:text-kenya-green"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Share
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleReply(post.id)}
                  className="text-muted-foreground hover:text-kenya-green"
                >
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Reply
                </Button>
              </div>

              <Button variant="ghost" size="sm" asChild>
                <Link to={`/blog/${post.slug}`}>
                  Read More
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
