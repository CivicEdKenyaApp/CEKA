
import { useState, useEffect } from 'react';

interface UseDocumentOptions {
  url: string;
  type: string;
}

interface UseDocumentResult {
  isLoading: boolean;
  error: string | null;
  documentUrl: string | null;
}

export function useDocument({ url, type }: UseDocumentOptions): UseDocumentResult {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadDocument = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Here we could add additional logic like:
        // - Check if the file exists
        // - Handle authentication for protected files
        // - Convert file formats if needed
        // For now, we'll just pass through the URL
        
        setDocumentUrl(url);
      } catch (err) {
        setError('Failed to load document');
        console.error('Document loading error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [url, type]);

  return { isLoading, error, documentUrl };
}
