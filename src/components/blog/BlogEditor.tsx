
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { BlogPost, blogService } from '@/services/blogService';

interface BlogEditorProps {
  post?: BlogPost;
  onSave: (post: BlogPost) => void;
  onCancel: () => void;
}

export function BlogEditor({ post, onSave, onCancel }: BlogEditorProps) {
  const [title, setTitle] = useState(post?.title || '');
  const [content, setContent] = useState(post?.content || '');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [status, setStatus] = useState<'draft' | 'published'>(post?.status || 'draft');
  const [newTag, setNewTag] = useState('');
  const [saving, setSaving] = useState(false);

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    setSaving(true);
    try {
      const postData: Partial<BlogPost> = {
        title: title.trim(),
        slug: blogService.generateSlug(title.trim()),
        content: content.trim(),
        excerpt: content.substring(0, 150) + (content.length > 150 ? '...' : ''),
        tags,
        status,
        publishedAt: status === 'published' ? new Date().toISOString() : (post?.publishedAt || new Date().toISOString())
      };

      let savedPost: BlogPost;
      if (post?.id) {
        savedPost = await blogService.updatePost(post.id, postData) as BlogPost;
      } else {
        savedPost = await blogService.createPost(postData);
      }

      onSave(savedPost);
    } catch (error) {
      console.error('Error saving post:', error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{post ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Post Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-lg font-semibold"
        />
        
        <Textarea
          placeholder="Write your post content here..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={15}
          className="min-h-[300px]"
        />
        
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="Add tag"
              value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              className="flex-1"
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

        <Select value={status} onValueChange={(value: 'draft' | 'published') => setStatus(value)}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2 pt-4">
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
