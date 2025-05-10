import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Video, Image as ImageIcon, File, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

interface DocumentViewerProps {
  url: string;
  type: string;
  title?: string;
  downloadUrl?: string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({ url, type, title, downloadUrl }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Reset states when URL changes
    setLoading(true);
    setError(null);
    
    // Simulate checking if file is accessible
    const checkFileAccess = async () => {
      try {
        // For real implementation, you might want to check if the file exists
        // This timeout simulates the loading process
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      } catch (err) {
        setLoading(false);
        setError('File could not be loaded');
      }
    };
    
    checkFileAccess();
  }, [url]);

  const getFileType = (): string => {
    // Extract file extension from URL or use provided type
    if (type && typeof type === 'string') {
      const lowerType = type.toLowerCase();
      
      // Check if type contains full MIME type
      if (lowerType.includes('/')) {
        if (lowerType.includes('pdf')) return 'pdf';
        if (lowerType.includes('video')) return 'video';
        if (lowerType.includes('image')) return 'image';
        if (lowerType.includes('text/plain')) return 'txt';
        if (lowerType.includes('msword') || lowerType.includes('wordprocessingml')) return 'doc';
      }
      
      // Check if type is just the extension
      if (lowerType === 'pdf') return 'pdf';
      if (lowerType === 'video' || lowerType === 'mp4' || lowerType === 'webm') return 'video';
      if (lowerType === 'image' || lowerType === 'jpg' || lowerType === 'jpeg' || 
          lowerType === 'png' || lowerType === 'gif') return 'image';
      if (lowerType === 'txt') return 'txt';
      if (lowerType === 'doc' || lowerType === 'docx') return 'doc';
    }
    
    // Try to extract extension from URL as fallback
    const urlExtension = url.split('.').pop()?.toLowerCase();
    if (urlExtension) {
      if (urlExtension === 'pdf') return 'pdf';
      if (['mp4', 'webm', 'mov'].includes(urlExtension)) return 'video';
      if (['jpg', 'jpeg', 'png', 'gif', 'svg'].includes(urlExtension)) return 'image';
      if (urlExtension === 'txt') return 'txt';
      if (['doc', 'docx'].includes(urlExtension)) return 'doc';
    }
    
    // Default fallback
    return 'unknown';
  };

  const renderLoader = () => (
    <div className="flex flex-col items-center justify-center p-12">
      <Skeleton className="h-4 w-32 mb-3" />
      <Skeleton className="h-64 w-full mb-3" />
      <Skeleton className="h-4 w-48" />
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
      <AlertCircle className="h-12 w-12 mb-4 text-destructive" />
      <h3 className="text-lg font-medium mb-2">Failed to load document</h3>
      <p className="mb-4">{error || "This document couldn't be loaded. It may be unavailable, restricted, or in an unsupported format."}</p>
      {downloadUrl && (
        <Button variant="outline" asChild>
          <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
            Download Instead
          </a>
        </Button>
      )}
    </div>
  );

  const getDocumentContent = () => {
    if (loading) {
      return renderLoader();
    }
    
    if (error) {
      return renderError();
    }
    
    const fileType = getFileType();
    
    switch (fileType) {
      case 'pdf':
        return (
          <div className="relative">
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-[500px] border-none rounded-md"
              title={title || "PDF document viewer"}
              onLoad={() => setLoading(false)}
              onError={() => setError("Failed to load PDF")}
            />
          </div>
        );
        
      case 'video':
        return (
          <video 
            controls 
            className="w-full rounded-md"
            controlsList="nodownload"
            onLoadedData={() => setLoading(false)}
            onError={() => setError("Failed to load video")}
          >
            <source src={url} type={type} />
            Your browser does not support the video tag.
          </video>
        );
        
      case 'image':
        return (
          <div className="flex justify-center">
            <img 
              src={url} 
              alt={title || "Document preview"} 
              className="max-w-full max-h-[600px] rounded-md object-contain"
              onLoad={() => setLoading(false)}
              onError={() => setError("Failed to load image")}
            />
          </div>
        );
        
      case 'txt':
        // For txt files, we could load the content directly or use an iframe
        return (
          <iframe
            src={url}
            className="w-full h-[500px] border-none rounded-md"
            title={title || "Text document viewer"}
            onLoad={() => setLoading(false)}
            onError={() => setError("Failed to load text document")}
          />
        );
        
      case 'doc':
        // Try to use Google Docs viewer for Office documents
        return (
          <div>
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
              className="w-full h-[500px] border-none rounded-md"
              title={title || "Document viewer"}
              onLoad={() => setLoading(false)}
              onError={() => setError("Failed to load document")}
            />
            {/* Fallback in case Google Docs viewer fails */}
            <div className="mt-2 text-center">
              <p className="text-sm text-muted-foreground mb-2">
                If the document doesn't load properly, you can download it instead.
              </p>
              {downloadUrl && (
                <Button size="sm" variant="outline" asChild>
                  <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                    Download Document
                  </a>
                </Button>
              )}
            </div>
          </div>
        );
        
      default:
        // Fallback for unsupported file types
        return (
          <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
            <File className="w-12 h-12 mb-4" />
            <p className="text-center mb-4">This file type is not supported for preview.</p>
            {downloadUrl && (
              <Button variant="outline" asChild>
                <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                  Download File
                </a>
              </Button>
            )}
          </div>
        );
    }
  };

  const getDocumentIcon = () => {
    const fileType = getFileType();
    
    switch (fileType) {
      case 'pdf':
        return <FileText className="h-5 w-5 mr-2" />;
      case 'video':
        return <Video className="h-5 w-5 mr-2" />;
      case 'image':
        return <ImageIcon className="h-5 w-5 mr-2" />;
      default:
        return <File className="h-5 w-5 mr-2" />;
    }
  };

  return (
    <Card className="overflow-hidden">
      {title && (
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center">
            {getDocumentIcon()}
            <h3 className="font-medium">{title}</h3>
          </div>
          {downloadUrl && (
            <Button variant="ghost" size="sm" asChild>
              <a href={downloadUrl} target="_blank" rel="noopener noreferrer">
                Download
              </a>
            </Button>
          )}
        </div>
      )}
      <div className="p-4">
        {getDocumentContent()}
      </div>
    </Card>
  );
};

export default DocumentViewer;
