import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Tag, Heart, Share2, MessageCircle, Bookmark, Eye, X, Facebook, Twitter, Linkedin, Copy } from 'lucide-react';
import { BlogPost } from '@/services/blogService';
import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { useViewCount } from '@/hooks/useViewCount';
import { DraftPostPreview } from './DraftPostPreview';

interface BlogListProps {
  posts: BlogPost[];
}

// Share Modal Component
const ShareModal: React.FC<{ post: BlogPost; isOpen: boolean; onClose: () => void }> = ({ post, isOpen, onClose }) => {
  const { toast } = useToast();
  
  if (!isOpen) return null;

  const shareUrl = `${window.location.origin}/blog/${post.slug}`;
  const postTitle = post.title;
  const postDescription = post.excerpt || post.content.slice(0, 150) + '...';

  const shareOptions = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      color: 'bg-green-500 hover:bg-green-600',
      action: () => {
        const text = `Check out this interesting article: *${postTitle}*\n\n${postDescription}\n\nRead more: ${shareUrl}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
        window.open(whatsappUrl, '_blank', 'width=600,height=400');
        onClose();
      }
    },
    {
      name: 'Twitter/X',
      icon: Twitter,
      color: 'bg-black hover:bg-gray-800',
      action: () => {
        const text = `${postTitle}\n\n${shareUrl}`;
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`;
        window.open(twitterUrl, '_blank', 'width=600,height=400');
        onClose();
      }
    },
    {
      name: 'Facebook',
      icon: Facebook,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => {
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(postTitle + ' - ' + postDescription)}`;
        window.open(facebookUrl, '_blank', 'width=600,height=400');
        onClose();
      }
    },
    {
      name: 'LinkedIn',
      icon: Linkedin,
      color: 'bg-blue-700 hover:bg-blue-800',
      action: () => {
        const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(postTitle)}&summary=${encodeURIComponent(postDescription)}`;
        window.open(linkedinUrl, '_blank', 'width=600,height=400');
        onClose();
      }
    },
    {
      name: 'Copy Link',
      icon: Copy,
      color: 'bg-gray-600 hover:bg-gray-700',
      action: async () => {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({
            title: "Link Copied",
            description: "Post link copied to clipboard"
          });
          onClose();
        } catch (error) {
          toast({
            title: "Copy Failed",
            description: "Failed to copy link to clipboard",
            variant: "destructive"
          });
        }
      }
    }
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Share this post</h3>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-3">
          {shareOptions.map((option) => {
            const IconComponent = option.icon;
            return (
              <Button
                key={option.name}
                variant="ghost"
                className={`w-full justify-start text-white ${option.color} hover:scale-105 transition-all`}
                onClick={option.action}
              >
                <IconComponent className="h-5 w-5 mr-3" />
                {option.name}
              </Button>
            );
          })}
        </div>
        
        <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-sm">
          <p className="font-medium mb-1 line-clamp-2">{postTitle}</p>
          <p className="text-gray-600 dark:text-gray-300 text-xs break-all">{shareUrl}</p>
        </div>
      </div>
    </div>
  );
};

export function BlogList({ posts }: BlogListProps) {
  const { session } = useAuth();
  const { toast } = useToast();
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());
  const [savedPosts, setSavedPosts] = useState<Set<string>>(new Set());
  
  // Share modal state
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

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

  // Enhanced share function
  const handleShare = async (post: BlogPost) => {
    const shareUrl = `${window.location.origin}/blog/${post.slug}`;
    const shareData = {
      title: post.title,
      text: post.excerpt || 'Check out this blog post on CEKA',
      url: shareUrl
    };

    // Try native share API first (mainly mobile)
    if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
      try {
        await navigator.share(shareData);
        return;
      } catch (error) {
        // User cancelled or error occurred, fall back to custom modal
        console.log('Native share cancelled or failed:', error);
      }
    }

    // Fall back to custom share modal
    setSelectedPost(post);
    setShowShareModal(true);
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
    <>
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

      {/* Share Modal */}
      {showShareModal && selectedPost && (
        <ShareModal
          post={selectedPost}
          isOpen={showShareModal}
          onClose={() => {
            setShowShareModal(false);
            setSelectedPost(null);
          }}
        />
      )}
    </>
  );
}
