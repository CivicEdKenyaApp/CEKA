
import React from 'react';
import { Card } from '@/components/ui/card';
import { FileText, Video, Image as ImageIcon } from 'lucide-react';

interface DocumentViewerProps {
  url: string;
  type: string;
  title?: string;
}

const DocumentViewer = ({ url, type, title }: DocumentViewerProps) => {
  const getDocumentContent = () => {
    const fileType = type.toLowerCase();
    
    if (fileType === 'pdf') {
      return (
        <iframe
          src={`${url}#toolbar=0`}
          className="w-full h-[600px] border-none rounded-md"
          title={title || "Document viewer"}
        />
      );
    }
    
    if (fileType.includes('video')) {
      return (
        <video 
          controls 
          className="w-full rounded-md"
          controlsList="nodownload"
        >
          <source src={url} type={type} />
          Your browser does not support the video tag.
        </video>
      );
    }
    
    if (fileType.includes('image')) {
      return (
        <img 
          src={url} 
          alt={title || "Document preview"} 
          className="w-full rounded-md"
        />
      );
    }

    if (fileType === 'txt' || fileType === 'doc' || fileType === 'docx') {
      return (
        <iframe
          src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
          className="w-full h-[600px] border-none rounded-md"
          title={title || "Document viewer"}
        />
      );
    }

    // Fallback for unsupported file types
    return (
      <div className="flex flex-col items-center justify-center p-8 text-muted-foreground">
        <FileText className="w-12 h-12 mb-2" />
        <p>This file type is not supported for preview.</p>
      </div>
    );
  };

  return (
    <Card className="overflow-hidden">
      {title && (
        <div className="p-4 border-b">
          <h3 className="font-medium">{title}</h3>
        </div>
      )}
      <div className="p-4">
        {getDocumentContent()}
      </div>
    </Card>
  );
};

export default DocumentViewer;
