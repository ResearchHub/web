'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import PDFViewer to reduce initial bundle size
const PDFViewer = dynamic(() => import('./PDFViewer'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  ),
});

interface DocumentViewerProps {
  url: string;
  className?: string;
}

export const DocumentViewer = ({ url, className }: DocumentViewerProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleReady = () => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    setError('Failed to load PDF document');
    setIsLoading(false);
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
      <PDFViewer
        pdfUrl={url}
        scale={1.0}
        onReady={handleReady}
        onLoadError={handleError}
        showWhenLoading={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        }
      />
    </div>
  );
};
