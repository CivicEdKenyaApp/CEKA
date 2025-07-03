
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  Image,
  Link,
  Code,
  Eye,
  FileText
} from 'lucide-react';
import { blogService } from '@/services/blogService';
import { useToast } from '@/hooks/use-toast';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  postId?: string;
  placeholder?: string;
}

export function RichTextEditor({ content, onChange, postId, placeholder = "Start writing..." }: RichTextEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const insertText = useCallback((before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    onChange(newText);
    
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  }, [content, onChange]);

  const formatText = useCallback((tag: string) => {
    insertText(`<${tag}>`, `</${tag}>`);
  }, [insertText]);

  const handleImageUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
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

    if (file.size > 10 * 1024 * 1024) { // 10MB
      toast({
        title: "File Too Large",
        description: "Please select an image smaller than 10MB",
        variant: "destructive"
      });
      return;
    }

    setIsUploading(true);
    try {
      const media = await blogService.uploadMedia(file, postId);
      if (media) {
        const imageHtml = `<img src="${media.file_url}" alt="${media.alt_text || 'Uploaded image'}" style="max-width: 100%; height: auto;" />`;
        insertText(imageHtml);
        toast({
          title: "Success",
          description: "Image uploaded successfully"
        });
      } else {
        throw new Error('Upload failed');
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: "Failed to upload image. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  }, [insertText, postId, toast]);

  const handleAddLink = useCallback(() => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text:') || url;
      insertText(`<a href="${url}" target="_blank" rel="noopener noreferrer">${text}</a>`);
    }
  }, [insertText]);

  const toolbarButtons = [
    { icon: Bold, action: () => formatText('strong'), title: 'Bold' },
    { icon: Italic, action: () => formatText('em'), title: 'Italic' },
    { icon: Underline, action: () => formatText('u'), title: 'Underline' },
    { icon: Strikethrough, action: () => formatText('s'), title: 'Strikethrough' },
    { separator: true },
    { icon: AlignLeft, action: () => insertText('<div style="text-align: left;">', '</div>'), title: 'Align Left' },
    { icon: AlignCenter, action: () => insertText('<div style="text-align: center;">', '</div>'), title: 'Align Center' },
    { icon: AlignRight, action: () => insertText('<div style="text-align: right;">', '</div>'), title: 'Align Right' },
    { separator: true },
    { icon: List, action: () => insertText('<ul><li>', '</li></ul>'), title: 'Bullet List' },
    { icon: ListOrdered, action: () => insertText('<ol><li>', '</li></ol>'), title: 'Numbered List' },
    { separator: true },
    { icon: Image, action: () => fileInputRef.current?.click(), title: 'Insert Image', disabled: isUploading },
    { icon: Link, action: handleAddLink, title: 'Insert Link' },
    { icon: Code, action: () => formatText('code'), title: 'Inline Code' },
  ];

  return (
    <Card className="w-full">
      <CardContent className="p-4">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-1 mb-4 p-2 border rounded-md bg-gray-50">
          {toolbarButtons.map((button, index) => (
            button.separator ? (
              <Separator key={index} orientation="vertical" className="h-6 mx-1" />
            ) : (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                disabled={button.disabled}
                title={button.title}
                className="h-8 w-8 p-0"
              >
                <button.icon className="h-4 w-4" />
              </Button>
            )
          ))}
          
          <Separator orientation="vertical" className="h-6 mx-1" />
          
          <Button
            variant={isPreviewMode ? "default" : "ghost"}
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            title={isPreviewMode ? "Edit Mode" : "Preview Mode"}
            className="h-8"
          >
            {isPreviewMode ? <FileText className="h-4 w-4 mr-1" /> : <Eye className="h-4 w-4 mr-1" />}
            {isPreviewMode ? "Edit" : "Preview"}
          </Button>
        </div>

        {/* Editor/Preview */}
        {isPreviewMode ? (
          <div className="min-h-[300px] p-4 border rounded-md bg-white">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">Nothing to preview...</p>' }}
            />
          </div>
        ) : (
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[300px] font-mono text-sm leading-relaxed resize-none"
          />
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />

        {/* Status */}
        {isUploading && (
          <div className="mt-2 text-sm text-blue-600">
            Uploading image...
          </div>
        )}
      </CardContent>
    </Card>
  );
}
