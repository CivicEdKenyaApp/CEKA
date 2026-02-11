import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit, Trash2, Eye, Check, X, Rocket, Sparkles, ShieldCheck, BrainCircuit } from 'lucide-react';
import { BlogEditor } from '@/components/blog/BlogEditor';
import { useBlog } from '@/hooks/useBlog';
import { BlogPost } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAIReview } from '@/hooks/useAIReview';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { SovereignSettings } from '@/components/admin/SovereignSettings';
import { BrainCircuit as LogicIcon } from 'lucide-react';

export function BlogManagement() {
  const [isEditing, setIsEditing] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | undefined>();
  const [editingDraft, setEditingDraft] = useState<any | undefined>();

  const { posts, loading: blogLoading, createPost, updatePost, deletePost } = useBlog();
  const { drafts, loading: aiLoading, approveArticle, rejectArticle, promoteToBlogPost, bulkPublishApproved } = useAIReview();
  const { toast } = useToast();

  const handleCreateNew = () => {
    setEditingPost(undefined);
    setEditingDraft(undefined);
    setIsEditing(true);
  };

  const handleEdit = (post: BlogPost) => {
    setEditingPost(post);
    setEditingDraft(undefined);
    setIsEditing(true);
  };

  const handleEditDraft = (draft: any) => {
    // Transform draft to look like a post for the editor
    const mockPost: any = {
      ...draft,
      content_type: 'html',
      status: 'draft'
    };
    setEditingDraft(draft);
    setEditingPost(mockPost);
    setIsEditing(true);
  };

  const handleSave = async (postData: BlogPost) => {
    try {
      if (editingDraft) {
        // Saving an edited AI draft
        await approveArticle(editingDraft.id); // Mark as approved
        // Then update the generated article content
        const { error } = await supabase
          .from('generated_articles' as any)
          .update({
            title: postData.title,
            content: postData.content,
            excerpt: postData.excerpt,
            meta_description: postData.meta_description,
            seo_keywords: postData.seo_keywords
          })
          .eq('id', editingDraft.id);

        if (error) throw error;

        toast({ title: "Draft Sanitized", description: "AI intelligence has been manually refined and stored." });
      } else if (editingPost) {
        await updatePost(editingPost.id, postData);
        toast({ title: "Success", description: "Post updated successfully" });
      } else {
        await createPost(postData);
        toast({ title: "Success", description: "Post created successfully" });
      }
      setIsEditing(false);
      setEditingPost(undefined);
      setEditingDraft(undefined);
    } catch (error) {
      toast({ title: "Error", description: "Failed to save content", variant: "destructive" });
    }
  };

  const togglePostStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    try {
      await updatePost(post.id, {
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : undefined
      });
      toast({
        title: newStatus === 'published' ? "Post Live" : "Post Paused",
        description: `Article is now ${newStatus}.`
      });
    } catch (error) {
      toast({ title: "Status Update Failed", variant: "destructive" });
    }
  };

  const handleDelete = async (postId: string) => {
    if (confirm('Are you sure you want to delete this content?')) {
      try {
        await deletePost(postId);
        toast({ title: "Success", description: "Deleted successfully" });
      } catch (error) {
        toast({ title: "Error", description: "Deletion failed", variant: "destructive" });
      }
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditingPost(undefined);
    setEditingDraft(undefined);
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-black tracking-tighter">Editorial Command Center</h1>
          <p className="text-muted-foreground mt-1">Manage manual post lifecycle and AI neural drafts.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={bulkPublishApproved} className="flex items-center gap-2 border-primary/20 bg-primary/5">
            <Rocket className="h-4 w-4" />
            Bulk Publish Drafts
          </Button>
          <Button onClick={handleCreateNew} className="flex items-center gap-2 bg-kenya-green hover:bg-kenya-green/90">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </div>
      </div>

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8 bg-slate-100 p-1.5 rounded-[24px] border border-slate-200/50 shadow-sm backdrop-blur-sm">
          <TabsTrigger value="posts" className="rounded-xl font-bold py-3 transition-all">Manual Factory ({posts.length})</TabsTrigger>
          <TabsTrigger value="ai" className="rounded-xl font-bold flex items-center gap-2 py-3 transition-all text-xs md:text-sm">
            <Sparkles className="h-4 w-4 text-kenya-red" />
            AI Drafts ({drafts.length})
          </TabsTrigger>
          <TabsTrigger value="logic" className="rounded-xl font-bold flex items-center gap-2 py-3 transition-all">
            <LogicIcon className="h-4 w-4 text-slate-900" />
            Logic Throne
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts">
          {blogLoading ? (
            <div className="text-center py-20 animate-pulse">Scanning the repository...</div>
          ) : (
            <div className="grid gap-6">
              {posts.length === 0 ? (
                <Card className="border-dashed border-2">
                  <CardContent className="py-20 text-center">
                    <p className="text-slate-400 mb-6 font-medium">The press is silent.</p>
                    <Button onClick={handleCreateNew} className="rounded-2xl px-10">Ignite the Machine</Button>
                  </CardContent>
                </Card>
              ) : (
                posts.map((post) => (
                  <Card key={post.id} className="hover:shadow-2xl transition-all border-black/5 rounded-[32px] overflow-hidden group">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 min-w-0">
                          <CardTitle className="text-2xl font-black tracking-tight truncate pr-4">{post.title}</CardTitle>
                          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 mt-2">
                            <span className={cn(
                              "px-2 py-0.5 rounded-full border",
                              post.status === 'published' ? "text-green-600 bg-green-50 border-green-100" : "text-amber-600 bg-amber-50 border-amber-100"
                            )}>
                              {post.status}
                            </span>
                            <span>{post.author}</span>
                            <span>{new Date(post.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-slate-100"
                            onClick={() => togglePostStatus(post)}
                            title={post.status === 'published' ? "Pause (Draft)" : "Push Live"}
                          >
                            {post.status === 'published' ? <X className="h-5 w-5 text-amber-500" /> : <Rocket className="h-5 w-5 text-green-500" />}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-slate-100"
                            onClick={() => handleEdit(post)}
                            title="Full Editorial Edit"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-destructive/10 text-destructive"
                            onClick={() => handleDelete(post.id)}
                            title="Decommission Post"
                          >
                            <Trash2 className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 line-clamp-2 text-sm leading-relaxed pr-10">
                        {post.excerpt || 'Article summary pending...'}
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
            <div className="text-center py-20 space-y-4">
              <Sparkles className="h-12 w-12 text-kenya-red animate-spin mx-auto opacity-50" />
              <p className="font-bold text-slate-400 uppercase tracking-widest text-xs">Decrypting Neural Patterns...</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {drafts.length === 0 ? (
                <Card className="border-dashed border-2 bg-slate-50/50">
                  <CardContent className="py-24 text-center">
                    <Sparkles className="h-16 w-16 text-slate-200 mx-auto mb-6" />
                    <p className="text-slate-400 font-black uppercase tracking-widest text-xs">The Neural Judge is Idle</p>
                    <p className="text-sm text-slate-400 mt-2 max-w-xs mx-auto">Scrapers are currently foraging for new legislative intelligence.</p>
                  </CardContent>
                </Card>
              ) : (
                drafts.map((draft) => (
                  <Card key={draft.id} className="border-kenya-red/10 bg-white hover:border-kenya-red/30 transition-all rounded-[32px] overflow-hidden group">
                    <CardHeader className="pb-4">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <CardTitle className="text-2xl font-black tracking-tight flex items-center gap-3">
                            <Sparkles className="h-5 w-5 text-kenya-red" />
                            {draft.title}
                          </CardTitle>
                          <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-slate-400 mt-2">
                            <span className="text-kenya-red bg-kenya-red/5 px-2 py-0.5 rounded-full border border-kenya-red/10 animate-pulse">Needs Review</span>
                            <span>{new Date(draft.created_at).toLocaleDateString()}</span>
                            <span>Score: {draft.analysis_score || 'N/A'}%</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-kenya-green/10 text-kenya-green"
                            onClick={() => promoteToBlogPost(draft)}
                            title="Instant Push-to-Live"
                          >
                            <Rocket className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-slate-100"
                            onClick={() => handleEditDraft(draft)}
                            title="Sanitize & Edit AI Draft"
                          >
                            <Edit className="h-5 w-5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-xl hover:bg-destructive/10 text-destructive"
                            onClick={() => rejectArticle(draft.id, 'Deemed non-essential by editorial mandate.')}
                            title="Purge Intelligence"
                          >
                            <X className="h-5 w-5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-slate-600 mb-6 italic text-sm pr-12 line-clamp-3 leading-relaxed border-l-2 border-slate-100 pl-4">
                        "{draft.excerpt}"
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {draft.seo_keywords?.map((kw: string, i: number) => (
                          <span key={i} className="text-[10px] font-black uppercase tracking-wider bg-slate-50 text-slate-400 border border-slate-100 rounded-lg px-2 py-1">#{kw}</span>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value="logic">
          <SovereignSettings />
        </TabsContent>
      </Tabs>
    </div>
  );
}
