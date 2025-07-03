
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';

export function BlogManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const { posts, loading, createPost, updatePost, deletePost } = useBlog();
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
        <h1 className="text-3xl font-bold">Blog Management</h1>
        <Button onClick={handleCreateNew} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create New Post
        </Button>
      </div>

      {loading ? (
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
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{post.title}</CardTitle>
                      <p className="text-sm text-gray-500 mt-1">
                        {post.status === 'published' ? 'Published' : 'Draft'} • 
                        {post.author} • 
                        {new Date(post.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(post)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(post.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 line-clamp-3">
                    {post.excerpt || 'No excerpt available'}
                  </p>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
