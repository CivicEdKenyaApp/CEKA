
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ThumbnailPreview } from './ThumbnailPreview';
import { Upload, Download, RefreshCw } from 'lucide-react';
import { thumbnailService } from '@/services/thumbnailService';
import { useToast } from '@/components/ui/use-toast';

interface ThumbnailGeneratorProps {
  onThumbnailGenerated?: (thumbnail: Blob) => void;
  defaultWidth?: number;
  defaultHeight?: number;
  className?: string;
}

export function ThumbnailGenerator({ 
  onThumbnailGenerated,
  defaultWidth = 300,
  defaultHeight = 200,
  className = ''
}: ThumbnailGeneratorProps) {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<'image' | 'video' | 'document'>('image');
  const [width, setWidth] = useState(defaultWidth);
  const [height, setHeight] = useState(defaultHeight);
  const [quality, setQuality] = useState(0.8);
  const [generating, setGenerating] = useState(false);
  const { toast } = useToast();

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Auto-detect type based on file
      if (selectedFile.type.startsWith('image/')) {
        setType('image');
      } else if (selectedFile.type.startsWith('video/')) {
        setType('video');
      } else {
        setType('document');
      }
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select a file first.",
        variant: "destructive"
      });
      return;
    }

    setGenerating(true);
    try {
      const thumbnail = await thumbnailService.generateThumbnail(file, type, {
        width,
        height,
        quality
      });
      
      onThumbnailGenerated?.(thumbnail);
      
      toast({
        title: "Thumbnail generated",
        description: "Your thumbnail has been created successfully.",
      });
    } catch (error) {
      console.error('Error generating thumbnail:', error);
      toast({
        title: "Generation failed",
        description: "Failed to generate thumbnail. Please try again.",
        variant: "destructive"
      });
    } finally {
      setGenerating(false);
    }
  }, [file, type, width, height, quality, onThumbnailGenerated, toast]);

  const handleDownload = useCallback(async () => {
    if (!file) return;
    
    try {
      const thumbnail = await thumbnailService.generateThumbnail(file, type, {
        width,
        height,
        quality
      });
      
      const url = URL.createObjectURL(thumbnail);
      const a = document.createElement('a');
      a.href = url;
      a.download = `thumbnail-${file.name}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your thumbnail is being downloaded.",
      });
    } catch (error) {
      console.error('Error downloading thumbnail:', error);
      toast({
        title: "Download failed",
        description: "Failed to download thumbnail.",
        variant: "destructive"
      });
    }
  }, [file, type, width, height, quality, toast]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Thumbnail Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="file">Select File</Label>
              <Input
                id="file"
                type="file"
                accept="image/*,video/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="type">Thumbnail Type</Label>
              <Select value={type} onValueChange={(value: 'image' | 'video' | 'document') => setType(value)}>
                <SelectTrigger id="type" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label htmlFor="width">Width</Label>
                <Input
                  id="width"
                  type="number"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                  min="50"
                  max="1000"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="height">Height</Label>
                <Input
                  id="height"
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  min="50"
                  max="1000"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="quality">Quality (0.1 - 1.0)</Label>
              <Input
                id="quality"
                type="number"
                value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                min="0.1"
                max="1.0"
                step="0.1"
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleGenerate} disabled={!file || generating} className="flex-1">
                {generating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={handleDownload} disabled={!file}>
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div>
            <Label>Preview</Label>
            <div className="mt-1">
              <ThumbnailPreview
                file={file}
                type={type}
                width={Math.min(width, 300)}
                height={Math.min(height, 200)}
                quality={quality}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
