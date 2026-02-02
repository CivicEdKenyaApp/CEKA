import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, Check, X, Rocket, Sparkles } from 'lucide-react';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIReview } from '@/hooks/useAIReview';

export function BlogManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const { posts, loading: blogLoading, createPost, updatePost, deletePost } = useBlog();
  const { drafts, loading: aiLoading, approveArticle, rejectArticle, promoteToBlogPost } = useAIReview();
  const { toast } = useToast();

  const handleCreateNew = () => {
    setEditingPost(undefined);
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setIsEditing(true);
  };

  const handleSave = async (post: BlogPost) => {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, post);
        toast({
          title: "Success",
          description: "Post updated successfully"
        });
      } else {
        await createPost(post);
        toast({
          title: "Success",
          description: "Post created successfully"
        });
      }
      setIsEditing(false);
      setEditingPost(undefined);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this post?')) {
      try {
        await deletePost(postId);
        toast({
          title: "Success",
          description: "Post deleted successfully"
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to delete post",
          variant: "destructive"
        });
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPost(undefined);
  };

  if (isEditing) {
    return (
      <div className="container mx-auto py-8 px-4">
        <BlogEditor
          post={editingPost}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground mt-1">Manage manual blog posts and AI-generated drafts.</p>
        </div>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="posts">Manual Posts ({posts.length})</TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            AI Review Queue ({drafts.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {blogLoading ? (
            <div className="text-center py-8">Loading posts...</div>
          ) : (
            <div className="grid gap-6">
              {posts.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-gray-500 mb-4">No blog posts yet</p>
                    <Button onClick={handleCreateNew}>Create Your First Post</Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-xl">{post.title}</CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            {post.status === 'published' ? (
                              <span className="text-green-600 font-medium">Published</span>
                            ) : (
                              <span className="text-yellow-600 font-medium">Draft</span>
                            )} •
                            {post.author} •
                            {new Date(post.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(post)}
                            title="Edit Post"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => handleDelete(post.id)}
                            title="Delete Post"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-2">
                        {post.excerpt || 'No excerpt available'}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="ai">
          {aiLoading ? (
            <div className="text-center py-8">Parsing neural patterns...</div>
          ) : (
            <div className="grid gap-6">
              {drafts.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <p className="text-gray-500 font-medium">No AI drafts pending review</p>
                    <p className="text-sm text-muted-foreground mt-1">The next automated generation cycle will populate this queue.</p>
                  </CardContent>
                </Card>
              ) : (
                drafts.map((draft) => (
                  <Card key={draft.id} className="border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-xl flex items-center gap-2">
                            {draft.title}
                            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold tracking-tighter">AI Draft</span>
                          </CardTitle>
                          <p className="text-sm text-gray-500 mt-1">
                            Generated on {new Date(draft.created_at).toLocaleDateString()} • {draft.status}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-green-500/10 text-green-700 hover:bg-green-500/20 border-green-500/20"
                            onClick={() => approveArticle(draft.id)}
                            title="Approve Draft"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                            onClick={() => promoteToBlogPost(draft)}
                            title="Publish to Blog"
                          >
                            <Rocket className="h-4 w-4 mr-1" />
                            Publish
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-destructive/10 text-destructive hover:bg-destructive/20 border-destructive/20"
                            onClick={() => rejectArticle(draft.id, 'Does not meet civic quality standards')}
                            title="Reject Draft"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 line-clamp-3 mb-4 italic">
                        "{draft.excerpt}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {draft.seo_keywords?.map((kw, i) => (
                          <span key={i} className="text-[10px] bg-white/50 border px-1.5 py-0.5 rounded">#{kw}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
