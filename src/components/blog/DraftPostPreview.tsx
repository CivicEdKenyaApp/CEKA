
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, Lock, Eye } from 'lucide-react';
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
    <Card className="relative border-2 border-dashed border-amber-200 bg-amber-50/50 hover:shadow-md transition-shadow">
      {/* Draft Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/90 z-10 pointer-events-none" />
      
      <CardHeader className="relative z-20">
        <div className="flex items-start justify-between">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-300">
                <Lock className="h-3 w-3 mr-1" />
                Draft
              </Badge>
              <Badge variant="outline" className="text-xs">
                Awaiting Approval
              </Badge>
            </div>
            
            <CardTitle className="text-xl text-gray-700">
              {post.title}
            </CardTitle>
            
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                {post.author}
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {new Date(post.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative z-20">
        <div className="space-y-4">
          {/* Preview text with fade effect */}
          <div className="relative">
            <p className="text-muted-foreground leading-relaxed">
              {previewText}
            </p>
            <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-amber-50 to-transparent" />
          </div>

          {/* Tags if available */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {post.tags.slice(0, 3).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs opacity-60">
                  {tag}
                </Badge>
              ))}
              {post.tags.length > 3 && (
                <Badge variant="outline" className="text-xs opacity-60">
                  +{post.tags.length - 3} more
                </Badge>
              )}
            </div>
          )}

          {/* Preview action */}
          <div className="flex items-center justify-between pt-4 border-t border-amber-200">
            <div className="flex items-center text-sm text-amber-600">
              <Eye className="h-4 w-4 mr-2" />
              <span>Preview • Full content available after approval</span>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handlePreviewClick}
              className="border-amber-300 text-amber-700 hover:bg-amber-100"
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
