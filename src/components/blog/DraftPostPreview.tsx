
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Lock, Eye, Clock } from 'lucide-react';
import { BlogPost } from '@/services/blogService';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/hooks/use-toast';

interface DraftPostPreviewProps {
  post: BlogPost;
}

export function DraftPostPreview({ post }: DraftPostPreviewProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const handlePreviewClick = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to view draft posts",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: "Draft Post",
      description: "This post is awaiting admin approval and will be available once published.",
      variant: "default"
    });
  };

  // Get preview text (first 150 characters)
  const previewText = post.content.length > 150 
    ? post.content.substring(0, 150) + "..."
    : post.content;

  return (
    <Card className="relative border-2 border-dashed border-amber-200 dark:border-amber-600 bg-gradient-to-br from-amber-50/80 via-amber-50/50 to-orange-50/30 dark:from-amber-900/20 dark:via-amber-800/10 dark:to-orange-900/5 hover:shadow-lg transition-all duration-300 hover:border-amber-300 dark:hover:border-amber-500">
      {/* Draft Overlay with Kenya-themed gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/90 dark:to-background/95 z-10 pointer-events-none" />
      
      <CardHeader className="relative z-20">
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="bg-amber-100 dark:bg-amber-900/50 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-600 font-medium">
                <Lock className="h-3 w-3 mr-1" />
                Draft
              </Badge>
              <Badge variant="outline" className="text-xs bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 border-orange-300 dark:border-orange-600">
                <Clock className="h-3 w-3 mr-1" />
                Awaiting Approval
              </Badge>
            </div>
            
            <CardTitle className="text-xl text-foreground/80 dark:text-foreground/90 leading-tight">
              {post.title}
            </CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span className="font-medium">{post.author}</span>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{new Date(post.created_at).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-20">
        <div className="space-y-4">
          {/* Preview text with fade effect */}
          <div className="relative">
            <p className="text-muted-foreground dark:text-muted-foreground/90 leading-relaxed">
              {previewText}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-50/80 via-amber-50/50 to-transparent dark:from-amber-900/20 dark:via-amber-800/10 dark:to-transparent" />
          </div>

          {/* Tags if available */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs opacity-70 bg-background/50 dark:bg-background/30">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs opacity-70 bg-background/50 dark:bg-background/30">
                  +{post.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Preview action */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-200/60 dark:border-amber-600/40">
            <div className="flex items-center text-sm text-amber-600 dark:text-amber-400">
              <Eye className="h-4 w-4 mr-2" />
              <span className="font-medium">Preview • Full content available after approval</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewClick}
              className="border-amber-300 dark:border-amber-600 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30 hover:border-amber-400 dark:hover:border-amber-500 kenyan-card transition-all duration-200"
            >
              <Lock className="h-4 w-4 mr-2" />
              Preview
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
