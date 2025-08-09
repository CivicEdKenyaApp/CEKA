
import React, { useState, useEffect } from 'react';
import { FileText, Download, ExternalLink, AlertCircle, Play, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/providers/AuthProvider';
import { useToast } from '@/components/ui/use-toast';

interface DocumentViewerProps {
  url: string;
  type: string;
  title: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, type, title }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string>('');
  const { session } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const processDocumentUrl = async () => {
      try {
        setLoading(true);
        setError(null);

        if (!url) {
          throw new Error('No document URL provided');
        }

        let processedUrl = url;

        // Handle Supabase storage URLs
        if (url.includes('supabase.co/storage/v1/object')) {
          // For Supabase storage, ensure we have the public access URL
          if (url.includes('/public/')) {
            processedUrl = url;
          } else if (url.includes('/sign/')) {
            // This is a signed URL that might be expired
            // Try to convert to public URL if possible
            const publicUrl = url.replace(/\/sign\/.*\?.*$/, '').replace('/object/', '/object/public/');
            processedUrl = publicUrl;
          } else {
            // Try to access the URL as is
            processedUrl = url;
          }
        }

        // For PDFs, ensure proper viewing
        if (type.toLowerCase().includes('pdf') || processedUrl.toLowerCase().includes('.pdf')) {
          // Add PDF viewer parameters
          processedUrl = `${processedUrl}#view=FitH&toolbar=1&navpanes=1&scrollbar=1`;
        }

        setDocumentUrl(processedUrl);
      } catch (err) {
        console.error('Error processing document URL:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setLoading(false);
      }
    };

    processDocumentUrl();
  }, [url, type]);

  const handleDownload = () => {
    if (!documentUrl) return;

    try {
      // Create download link
      const downloadUrl = documentUrl.includes('?') 
        ? `${documentUrl}&download=1` 
        : `${documentUrl}?download=1`;
      
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = title || 'document';
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Download started",
        description: "Your download has begun.",
      });
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download failed",
        description: "Unable to download the document. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleOpenInNewTab = () => {
    if (!documentUrl) return;
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  const renderVideoPlayer = () => {
    // Handle YouTube URLs
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      let videoId = '';
      if (url.includes('youtube.com/watch?v=')) {
        videoId = url.split('v=')[1]?.split('&')[0] || '';
      } else if (url.includes('youtu.be/')) {
        videoId = url.split('youtu.be/')[1]?.split('?')[0] || '';
      }

      if (videoId) {
        return (
          <div className="aspect-video w-full">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={title}
              className="w-full h-full rounded-lg"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        );
      }
    }

    // Handle direct video URLs
    return (
      <div className="aspect-video w-full bg-black rounded-lg flex items-center justify-center">
        <video 
          controls 
          className="w-full h-full rounded-lg"
          preload="metadata"
        >
          <source src={documentUrl} type="video/mp4" />
          <source src={documentUrl} type="video/webm" />
          <source src={documentUrl} type="video/ogg" />
          Your browser does not support the video tag.
        </video>
      </div>
    );
  };

  const renderPDFViewer = () => (
    <div className="w-full h-96 border rounded-lg overflow-hidden bg-gray-50">
      <iframe
        src={documentUrl}
        title={title}
        className="w-full h-full"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError('Failed to load PDF document');
          setLoading(false);
        }}
      />
    </div>
  );

  const renderImageViewer = () => (
    <div className="w-full flex justify-center">
      <img
        src={documentUrl}
        alt={title}
        className="max-w-full h-auto rounded-lg shadow-lg"
        onLoad={() => setLoading(false)}
        onError={() => {
          setError('Failed to load image');
          setLoading(false);
        }}
      />
    </div>
  );

  const renderFallbackViewer = () => (
    <Card>
      <CardContent className="p-8 text-center">
        <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Document Preview Not Available</h3>
        <p className="text-muted-foreground mb-6">
          This document type cannot be previewed in the browser. 
          You can download it or open it in a new tab.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={handleDownload} className="bg-kenya-green hover:bg-kenya-green/90">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="outline" onClick={handleOpenInNewTab}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading document...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="flex justify-between items-center">
            <span>{error}</span>
            <div className="flex gap-2 ml-4">
              <Button size="sm" onClick={handleDownload} className="bg-kenya-green hover:bg-kenya-green/90">
                <Download className="mr-1 h-3 w-3" />
                Download
              </Button>
              <Button size="sm" variant="outline" onClick={handleOpenInNewTab}>
                <ExternalLink className="mr-1 h-3 w-3" />
                Open
              </Button>
            </div>
          </div>
        </AlertDescription>
      </Alert>
    );
  }

  // Render appropriate viewer based on document type
  const lowerType = type.toLowerCase();
  
  if (lowerType.includes('video') || url.includes('youtube') || url.includes('youtu.be')) {
    return (
      <div className="space-y-4">
        {renderVideoPlayer()}
        <div className="flex justify-center">
          <Button variant="outline" onClick={handleOpenInNewTab}>
            <Play className="mr-2 h-4 w-4" />
            Open in Player
          </Button>
        </div>
      </div>
    );
  }
  
  if (lowerType.includes('pdf') || lowerType.includes('document')) {
    return (
      <div className="space-y-4">
        {renderPDFViewer()}
        <div className="flex justify-center gap-4">
          <Button onClick={handleDownload} className="bg-kenya-green hover:bg-kenya-green/90">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={handleOpenInNewTab}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Open in New Tab
          </Button>
        </div>
      </div>
    );
  }
  
  if (lowerType.includes('image') || lowerType.includes('infographic')) {
    return (
      <div className="space-y-4">
        {renderImageViewer()}
        <div className="flex justify-center gap-4">
          <Button onClick={handleDownload} className="bg-kenya-green hover:bg-kenya-green/90">
            <Download className="mr-2 h-4 w-4" />
            Download Image
          </Button>
          <Button variant="outline" onClick={handleOpenInNewTab}>
            <ExternalLink className="mr-2 h-4 w-4" />
            View Full Size
          </Button>
        </div>
      </div>
    );
  }

  return renderFallbackViewer();
};

export default DocumentViewer;
