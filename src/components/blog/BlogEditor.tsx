
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { X, Upload } from 'lucide-react';
import { BlogPost, blogService, BlogCategory } from '@/services/blogService';
import { RichTextEditor } from './RichTextEditor';
import { useToast } from '@/hooks/use-toast';

interface BlogEditorProps {
  post?: BlogPost;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [contentType, setContentType] = useState<'html' | 'markdown'>(post?.content_type || 'html');
  const [excerpt, setExcerpt] = useState(post?.excerpt || '');
  const [metaDescription, setMetaDescription] = useState(post?.meta_description || '');
  const [featuredImageUrl, setFeaturedImageUrl] = useState(post?.featured_image_url || '');
  const [seoKeywords, setSeoKeywords] = useState<string[]>(post?.seo_keywords || []);
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [status, setStatus] = useState<'draft' | 'published'>(
    (post?.status === 'published' ? 'published' : 'draft') as 'draft' | 'published'
  );
  const [categoryId, setCategoryId] = useState(post?.category_id || '');
  const [newTag, setNewTag] = useState('');
  const [newKeyword, setNewKeyword] = useState('');
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<BlogCategory[]>([]);

  const { toast } = useToast();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    const fetchedCategories = await blogService.getCategories();
    setCategories(fetchedCategories);
  };

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleAddKeyword = () => {
    if (newKeyword.trim() && !seoKeywords.includes(newKeyword.trim())) {
      setSeoKeywords([...seoKeywords, newKeyword.trim()]);
      setNewKeyword('');
    }
  };

  const handleRemoveKeyword = (keywordToRemove: string) => {
    setSeoKeywords(seoKeywords.filter(keyword => keyword !== keywordToRemove));
  };

  const handleFeaturedImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid File",
        description: "Please select an image file",
        variant: "destructive"
      });
      return;
    }

    try {
      const media = await blogService.uploadMedia(file, post?.id);
      if (media) {
        setFeaturedImageUrl(media.file_url);
        toast({
          title: "Success",
          description: "Featured image uploaded successfully"
        });
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload featured image",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      toast({
        title: "Missing Required Fields",
        description: "Please provide both title and content",
        variant: "destructive"
      });
      return;
    }

    setSaving(true);
    try {
      const postData: Partial<BlogPost> = {
        title: title.trim(),
        slug: blogService.generateSlug(title.trim()),
        content: content.trim(),
        content_type: contentType,
        excerpt: excerpt.trim() || content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        meta_description: metaDescription.trim(),
        featured_image_url: featuredImageUrl.trim() || undefined,
        seo_keywords: seoKeywords.length > 0 ? seoKeywords : undefined,
        tags,
        status,
        category_id: categoryId || undefined,
        published_at: status === 'published' ? new Date().toISOString() : (post?.published_at || undefined)
      };

      let savedPost: BlogPost | null;
      if (post?.id) {
        savedPost = await blogService.updatePost(post.id, postData);
      } else {
        savedPost = await blogService.createPost(postData);
      }

      if (savedPost) {
        onSave(savedPost);
      } else {
        throw new Error('Failed to save post');
      }
    } catch (error) {
      console.error('Error saving post:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save post. Please try again.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-6xl mx-auto">
      <CardHeader>
        <CardTitle>{post ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="content" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Enter post title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-lg font-semibold"
                />
              </div>

              <div>
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  name="excerpt"
                  placeholder="Brief description of your post (optional - will be auto-generated if left empty)"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={2}
                />
              </div>

              <div>
                <Label>Content *</Label>
                <div className="mt-2">
                  <RichTextEditor
                    content={content}
                    onChange={setContent}
                    postId={post?.id}
                    placeholder="Start writing your blog post..."
                  />
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
                  <SelectTrigger id="status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="category">Category</Label>
                <Select name="category" value={categoryId} onValueChange={setCategoryId}>
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Category</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="content-type">Content Type</Label>
                <Select name="content_type" value={contentType} onValueChange={(value: 'html' | 'markdown') => setContentType(value)}>
                  <SelectTrigger id="content-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="html">HTML</SelectItem>
                    <SelectItem value="markdown">Markdown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Featured Image</Label>
                <div className="mt-2">
                  {featuredImageUrl && (
                    <div className="mb-2">
                      <img
                        src={featuredImageUrl}
                        alt="Featured"
                        className="max-w-xs h-32 object-cover rounded border"
                      />
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Input
                      id="featured-image-url"
                      name="featured_image_url"
                      placeholder="Featured image URL"
                      value={featuredImageUrl}
                      onChange={(e) => setFeaturedImageUrl(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById('featured-image-upload')?.click()}
                    >
                      <Upload className="h-4 w-4" />
                    </Button>
                    <input
                      id="featured-image-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleFeaturedImageUpload}
                      className="hidden"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Tags</Label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      id="tags-input"
                      name="tags_input"
                      placeholder="Add tag"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                    />
                    <Button onClick={handleAddTag} variant="outline">
                      Add Tag
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleRemoveTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-4">
            <div>
              <Label htmlFor="meta-description">Meta Description</Label>
              <Textarea
                id="meta-description"
                name="meta_description"
                placeholder="Brief description for search engines (150-160 characters recommended)"
                value={metaDescription}
                onChange={(e) => setMetaDescription(e.target.value)}
                rows={3}
              />
              <div className="text-sm text-gray-500 mt-1">
                {metaDescription.length}/160 characters
              </div>
            </div>

            <div>
              <Label>SEO Keywords</Label>
              <div className="space-y-2">
                <div className="flex gap-2">
                  <Input
                    id="seo-keywords-input"
                    name="seo_keywords_input"
                    placeholder="Add SEO keyword"
                    value={newKeyword}
                    onChange={(e) => setNewKeyword(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
                  />
                  <Button onClick={handleAddKeyword} variant="outline">
                    Add Keyword
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {seoKeywords.map((keyword) => (
                    <Badge key={keyword} variant="outline" className="flex items-center gap-1">
                      {keyword}
                      <X
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveKeyword(keyword)}
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex gap-2 pt-6 border-t mt-6">
          <Button onClick={handleSave} disabled={saving || !title.trim() || !content.trim()}>
            {saving ? 'Saving...' : 'Save Post'}
          </Button>
          <Button onClick={onCancel} variant="outline">
            Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
