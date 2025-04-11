'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import DocumentSkeleton from '@/components/skeletons/DocumentSkeleton';

// Dynamically import PDFViewer to reduce initial bundle size
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => null,
});

interface DocumentViewerProps {
  url: string;
  className?: string;
  onLoaded?: () => void;
}

export const DocumentViewer = ({ url, className, onLoaded }: DocumentViewerProps) => {
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
          <DocumentSkeleton className="min-h-[800px]" lines={30} />
        </div>
      )}
      <div className={isLoading ? 'opacity-0' : 'opacity-100 transition-opacity duration-300'}>
        <PDFViewer
          pdfUrl={url}
          scale={1.0}
          onReady={handleReady}
          onLoadError={handleError}
          enableTextSelection={true}
          showWhenLoading={null}
        />
      </div>
    </div>
  );
};
