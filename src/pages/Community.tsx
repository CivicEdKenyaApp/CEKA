
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useBlog } from '@/hooks/useBlog';
import { BlogList } from '@/components/blog/BlogList';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { BlogPost } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';

const Community = () => {
  const { posts, loading, createPost, updatePost } = useBlog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const isAdmin = user?.email === 'admin@ceka.app'; // Adjust admin check as needed

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
    // Show drafts only to admins
    if (post.status === 'draft' && !isAdmin) return false;
    
    return matchesSearch && matchesStatus;
  });

  const handleCreateNew = () => {
    if (!user) {
      toast({
        title: "Sign In Required",
        description: "Please sign in to create a post",
        variant: "destructive"
      });
      return;
    }
    setIsCreating(true);
  };

  const handleSavePost = async (post: BlogPost) => {
    try {
      if (editingPost) {
        await updatePost(editingPost.id, post);
        setEditingPost(null);
        toast({
          title: "Success",
          description: "Post updated successfully"
        });
      } else {
        await createPost(post);
        setIsCreating(false);
        toast({
          title: "Success",
          description: "Post created successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post",
        variant: "destructive"
      });
    }
  };

  const handleCancelEdit = () => {
    setIsCreating(false);
    setEditingPost(null);
  };

  if (loading) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center">Loading posts...</div>
        </div>
      </Layout>
    );
  }

  if (isCreating || editingPost) {
    return (
      <Layout>
        <div className="container py-8">
          <BlogEditor
            post={editingPost || undefined}
            onSave={handleSavePost}
            onCancel={handleCancelEdit}
          />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold mb-2">CEKA Community</h1>
            <p className="text-muted-foreground">
              Join the conversation with civic education insights, updates, and community discussions
            </p>
          </div>
          
          <Button onClick={handleCreateNew} className="mt-4 md:mt-0">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        <Tabs defaultValue="published" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <TabsList>
              <TabsTrigger value="published">Community Posts</TabsTrigger>
              {isAdmin && <TabsTrigger value="drafts">Drafts</TabsTrigger>}
              {isAdmin && <TabsTrigger value="all">All Posts</TabsTrigger>}
            </TabsList>

            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              {isAdmin && (
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <TabsContent value="published">
            <BlogList posts={filteredPosts.filter(post => post.status === 'published')} />
          </TabsContent>

          {isAdmin && (
            <TabsContent value="drafts">
              <BlogList posts={filteredPosts.filter(post => post.status === 'draft')} />
            </TabsContent>
          )}

          {isAdmin && (
            <TabsContent value="all">
              <BlogList posts={filteredPosts} />
            </TabsContent>
          )}
        </Tabs>
      </div>
    </Layout>
  );
};

export default Community;
