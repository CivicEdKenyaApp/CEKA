
import { useState, useEffect } from 'react';
import { thumbnailService } from '@/services/thumbnailService';

interface ThumbnailOptions {
  width?: number;
  height?: number;
  quality?: number;
}

export function useThumbnail(
  file: File | null, 
  type: 'image' | 'video' | 'document',
  options: ThumbnailOptions = {}
) {
  const [thumbnail, setThumbnail] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setThumbnail(null);
      setError(null);
      return;
    }

    const generateThumbnail = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const blob = await thumbnailService.generateThumbnail(file, type, options);
        const url = URL.createObjectURL(blob);
        setThumbnail(url);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to generate thumbnail');
        setThumbnail(null);
      } finally {
        setLoading(false);
      }
    };

    generateThumbnail();

    // Cleanup function to revoke object URL
    return () => {
      if (thumbnail) {
        URL.revokeObjectURL(thumbnail);
      }
    };
  }, [file, type, options.width, options.height, options.quality]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (thumbnail) {
        URL.revokeObjectURL(thumbnail);
      }
    };
  }, []);

  return { thumbnail, loading, error };
}
