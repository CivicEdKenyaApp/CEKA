
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { useBlog } from '@/hooks/useBlog';
import { BlogList } from '@/components/blog/BlogList';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, Search, Settings } from 'lucide-react';
import { useAuth } from '@/providers/AuthProvider';
import { BlogPost, blogService } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';
import { Link, useNavigate } from 'react-router-dom';
import { useAdmin } from '@/hooks/useAdmin';

const Blog = () => {
  const { posts, loading, createPost, updatePost } = useBlog();
  const { user } = useAuth();
  const { isAdmin } = useAdmin();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isCreating, setIsCreating] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Filter posts based on search and status
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || post.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Separate posts by status
  const publishedPosts = filteredPosts.filter(post => post.status === 'published');
  const draftPosts = filteredPosts.filter(post => post.status === 'draft');
  const allPosts = [...publishedPosts, ...draftPosts]; // Show published first, then drafts

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
          description: "Post submitted for review successfully! You'll be notified once it's approved."
        });
      }
      
      // Navigate back to the main blog page
      setTimeout(() => {
        navigate('/blog');
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save post. Please try again.",
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
            <h1 className="text-3xl md:text-4xl font-bold mb-2">CEKA Blog</h1>
            <p className="text-muted-foreground">
              Insights, updates, and discussions on civic education and governance in Kenya
            </p>
          </div>
          
          <div className="flex gap-2 mt-4 md:mt-0">
            <Button onClick={handleCreateNew} className="">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Post
            </Button>
            
            {isAdmin && (
              <Button variant="outline" asChild>
                <Link to="/admin/dashboard">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin
                </Link>
              </Button>
            )}
          </div>
        </div>

        <Tabs defaultValue="all" className="space-y-6">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <TabsList>
              <TabsTrigger value="all">All Posts</TabsTrigger>
              <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
              <TabsTrigger value="drafts">Drafts ({draftPosts.length})</TabsTrigger>
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

          <TabsContent value="all">
            <div className="space-y-6">
              {draftPosts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold text-amber-600 border-b border-amber-200 pb-2">
                    Coming Soon - Awaiting Approval ({draftPosts.length})
                  </h2>
                  <BlogList posts={draftPosts} />
                </div>
              )}
              
              {publishedPosts.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-lg font-semibold border-b pb-2">
                    Published Posts ({publishedPosts.length})
                  </h2>
                  <BlogList posts={publishedPosts} />
                </div>
              )}
              
              {allPosts.length === 0 && (
                <div className="text-center py-12">
                  <h3 className="text-lg font-medium mb-2">No posts found</h3>
                  <p className="text-muted-foreground">Check back later for new content or create the first post!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="published">
            <BlogList posts={publishedPosts} />
          </TabsContent>

          <TabsContent value="drafts">
            <BlogList posts={draftPosts} />
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Blog;
