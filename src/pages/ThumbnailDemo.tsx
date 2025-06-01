
import React, { useState } from 'react';
import Layout from '@/components/layout/Layout';
import { ThumbnailGenerator } from '@/components/ui/ThumbnailGenerator';
import { ThumbnailPreview } from '@/components/ui/ThumbnailPreview';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Trash2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const ThumbnailDemo = () => {
  const [generatedThumbnails, setGeneratedThumbnails] = useState<Array<{
    id: string;
    blob: Blob;
    filename: string;
    timestamp: Date;
  }>>([]);
  const { toast } = useToast();

  const handleThumbnailGenerated = (thumbnail: Blob) => {
    const id = Date.now().toString();
    const filename = `thumbnail-${id}.jpg`;
    
    setGeneratedThumbnails(prev => [
      ...prev,
      {
        id,
        blob: thumbnail,
        filename,
        timestamp: new Date()
      }
    ]);
  };

  const handleDownloadThumbnail = (thumbnail: { blob: Blob; filename: string }) => {
    const url = URL.createObjectURL(thumbnail.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = thumbnail.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Download started",
      description: `${thumbnail.filename} is being downloaded.`,
    });
  };

  const handleDeleteThumbnail = (id: string) => {
    setGeneratedThumbnails(prev => prev.filter(thumb => thumb.id !== id));
    toast({
      title: "Thumbnail deleted",
      description: "The thumbnail has been removed.",
    });
  };

  const clearAllThumbnails = () => {
    setGeneratedThumbnails([]);
    toast({
      title: "All thumbnails cleared",
      description: "All generated thumbnails have been removed.",
    });
  };

  return (
    <Layout>
      <div className="container py-8 md:py-12">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Thumbnail System Demo</h1>
          <p className="text-muted-foreground">
            Generate thumbnails from images, videos, and documents. Test the thumbnail system 
            functionality with different file types and settings.
          </p>
        </div>

        <div className="grid gap-8">
          <ThumbnailGenerator 
            onThumbnailGenerated={handleThumbnailGenerated}
            className="w-full"
          />

          {generatedThumbnails.length > 0 && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Generated Thumbnails ({generatedThumbnails.length})</CardTitle>
                  <Button 
                    variant="outline" 
                    onClick={clearAllThumbnails}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear All
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {generatedThumbnails.map((thumbnail) => (
                    <div key={thumbnail.id} className="space-y-2">
                      <div className="relative group">
                        <img
                          src={URL.createObjectURL(thumbnail.blob)}
                          alt={thumbnail.filename}
                          className="w-full h-32 object-cover rounded-md border"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors rounded-md flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleDownloadThumbnail(thumbnail)}
                            >
                              <Download className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteThumbnail(thumbnail.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs font-medium truncate">{thumbnail.filename}</p>
                        <div className="flex items-center justify-between">
                          <Badge variant="secondary" className="text-xs">
                            {(thumbnail.blob.size / 1024).toFixed(1)} KB
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {thumbnail.timestamp.toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Features Demonstrated</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Image Thumbnails</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Automatic aspect ratio preservation</li>
                    <li>• Smart cropping to fit dimensions</li>
                    <li>• Adjustable quality settings</li>
                    <li>• Support for JPEG, PNG, WebP</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Video Thumbnails</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Frame extraction at 25% duration</li>
                    <li>• Maintains video aspect ratio</li>
                    <li>• Works with MP4, WebM formats</li>
                    <li>• No external dependencies</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Document Thumbnails</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Generated placeholder with document icon</li>
                    <li>• Shows truncated filename</li>
                    <li>• Consistent styling across file types</li>
                    <li>• Canvas-based generation</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">System Features</h3>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Real-time preview updates</li>
                    <li>• Customizable dimensions</li>
                    <li>• Batch generation support</li>
                    <li>• Memory-efficient cleanup</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default ThumbnailDemo;
