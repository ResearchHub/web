'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import DocumentSkeleton from '@/components/skeletons/DocumentSkeleton';

// Dynamically import PDFViewer (client-side only)
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  // Simple loading fallback while the chunk is being fetched
  loading: () => (
    <div className="flex items-center justify-center py-8 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading PDF viewer…
    </div>
  ),
});

interface DocumentViewerProps {
  url: string;
  className?: string;
  onLoaded?: () => void;
  onPdfUnavailable?: () => void;
}

export const DocumentViewer = ({
  url,
  className,
  onLoaded,
  onPdfUnavailable,
}: DocumentViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (isLoading && onLoaded) {
        onLoaded();
      }
    };
  }, [isLoading, onLoaded]);

  const handleReady = () => {
    console.log('PDF ready, calling onLoaded callback');
    setTimeout(() => {
      setIsLoading(false);
      if (onLoaded) {
        onLoaded();
      }
    }, 300);
  };

  const handleError = (error: any) => {
    console.error('PDF loading error:', error);

    // If the PDF request returns errors, treat it as unavailable
    if (error?.status && error.status >= 400) {
      // HTTP errors fail silently, allowing the parent to show the abstract instead
      setError(null);
      setIsLoading(false);
      if (onPdfUnavailable) {
        onPdfUnavailable();
      }
      if (onLoaded) {
        onLoaded();
      }
      return;
    }

    // ... for other errors, show error message
    setError('Failed to load PDF document');
    setIsLoading(false);
    if (onLoaded) {
      onLoaded();
    }
  };

  if (error) {
    return (
      <div className="flex items-center justify-center p-8 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {isLoading && (
        <div className="absolute inset-0 bg-white z-10">
          <DocumentSkeleton className="min-h-[800px]" lines={22} />
        </div>
      )}
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        <PDFViewer url={url} onReady={handleReady} onError={handleError} />
      </div>
    </div>
  );
};
