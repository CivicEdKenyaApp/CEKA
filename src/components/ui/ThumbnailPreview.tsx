
import React from 'react';
import { useThumbnail } from '@/hooks/useThumbnail';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, FileText, Image as ImageIcon, Video } from 'lucide-react';

interface ThumbnailPreviewProps {
  file: File | null;
  type: 'image' | 'video' | 'document';
  className?: string;
  width?: number;
  height?: number;
  quality?: number;
}

export function ThumbnailPreview({ 
  file, 
  type, 
  className = '', 
  width = 300, 
  height = 200,
  quality = 0.8 
}: ThumbnailPreviewProps) {
  const { thumbnail, loading, error } = useThumbnail(file, type, { width, height, quality });

  if (!file) {
    return (
      <Card className={`flex items-center justify-center bg-muted ${className}`} style={{ width, height }}>
        <div className="text-center text-muted-foreground">
          {type === 'image' && <ImageIcon className="h-12 w-12 mx-auto mb-2" />}
          {type === 'video' && <Video className="h-12 w-12 mx-auto mb-2" />}
          {type === 'document' && <FileText className="h-12 w-12 mx-auto mb-2" />}
          <p className="text-sm">No file selected</p>
        </div>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className={`overflow-hidden ${className}`} style={{ width, height }}>
        <Skeleton className="w-full h-full" />
      </Card>
    );
  }

  if (error || !thumbnail) {
    return (
      <Card className={`flex items-center justify-center bg-muted ${className}`} style={{ width, height }}>
        <div className="text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-2 text-destructive" />
          <p className="text-sm">Failed to generate thumbnail</p>
          {error && <p className="text-xs mt-1">{error}</p>}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden ${className}`} style={{ width, height }}>
      <img 
        src={thumbnail} 
        alt={`Thumbnail of ${file.name}`}
        className="w-full h-full object-cover"
      />
    </Card>
  );
}
