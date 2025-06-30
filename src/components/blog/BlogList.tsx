import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Tag, Heart, Share2, MessageCircle, Bookmark, Eye } from 'lucide-react';
import { BlogPost } from '@/services/blogService';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useViewCount } from '@/hooks/useViewCount';
import { DraftPostPreview } from './DraftPostPreview';

interface BlogListProps {
  posts: BlogPost[];
}

export function BlogList({ posts }: BlogListProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());

  const handleLike = (postId: string) => {
    if (!session) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to like posts",
        variant: "destructive"
      });
      return;
    }

    const newLikedPosts = new Set(likedPosts);
    if (likedPosts.has(postId)) {
      newLikedPosts.delete(postId);
      toast({
        title: "Unliked",
        description: "Post unliked"
      });
    } else {
      newLikedPosts.add(postId);
      toast({
        title: "Liked",
        description: "Post liked successfully!"
      });
    }
    setLikedPosts(newLikedPosts);
  };

  const handleSave = (postId: string) => {
    if (!session) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to save posts",
        variant: "destructive"
      });
      return;
    }

    const newSavedPosts = new Set(savedPosts);
    if (savedPosts.has(postId)) {
      newSavedPosts.delete(postId);
      toast({
        title: "Unsaved",
        description: "Post removed from saved items"
      });
    } else {
      newSavedPosts.add(postId);
      toast({
        title: "Saved",
        description: "Post saved successfully!"
      });
    }
    setSavedPosts(newSavedPosts);
  };

  const handleShare = async (post: BlogPost) => {
    const shareUrl = `${window.location.origin}/blog/${post.slug}`;
    const shareData = {
      title: post.title,
      text: post.excerpt || 'Check out this blog post on CEKA',
      url: shareUrl
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(shareUrl);
        toast({
          title: "Link Copied",
          description: "Post link copied to clipboard"
        });
      } catch (error) {
        // Show social media options
        const shareText = `Check out this post: ${post.title} - ${shareUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
        
        toast({
          title: "Share this post",
          description: (
            <div className="space-y-2">
              <div className="flex gap-2">
                <Button size="sm" onClick={() => window.open(whatsappUrl, '_blank')}>
                  WhatsApp
                </Button>
                <Button size="sm" onClick={() => window.open(twitterUrl, '_blank')}>
                  Twitter
                </Button>
              </div>
            </div>
          )
        });
      }
    }
  };

  const handleReply = (postId: string) => {
    if (!session) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to reply to posts",
        variant: "destructive"
      });
      return;
    }
    
    // Navigate to the blog post with reply form
    window.location.href = `/blog/${posts.find(p => p.id === postId)?.slug}#reply`;
  };

  const PostViewCount = ({ postId }: { postId: string }) => {
    const viewCount = useViewCount(postId, 'blog_post');
    
    return (
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Eye className="h-3 w-3" />
        {viewCount} views
      </div>
    );
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
      {posts.map((post) => {
        // If post is draft, show preview component
        if (post.status === 'draft') {
          return <DraftPostPreview key={post.id} post={post} />;
        }

        // Otherwise show regular post card
        const isLiked = likedPosts.has(post.id);
        const isSaved = savedPosts.has(post.id);
        
        return (
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
                    <PostViewCount postId={post.id} />
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

              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center gap-2">
                  <Button
                    variant={isLiked ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleLike(post.id)}
                    className={isLiked ? "bg-kenya-green hover:bg-kenya-green/90" : "text-muted-foreground hover:text-kenya-green"}
                  >
                    <Heart className={`h-4 w-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
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

                  <Button
                    variant={isSaved ? "default" : "ghost"}
                    size="sm"
                    onClick={() => handleSave(post.id)}
                    className={isSaved ? "bg-kenya-green hover:bg-kenya-green/90" : "text-muted-foreground hover:text-kenya-green"}
                  >
                    <Bookmark className={`h-4 w-4 mr-1 ${isSaved ? 'fill-current' : ''}`} />
                    Save
                  </Button>
                </div>
                
                <Button variant="ghost" size="sm" asChild>
                  <Link to={`/blog/${post.slug}`}>
                    Read more
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
