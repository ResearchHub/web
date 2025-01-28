'use client';

import { useRef, useState } from 'react';
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
  const contentRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleReady = ({ numPages }: { numPages: number }) => {
    setIsLoading(false);
  };

  const handleError = (error: any) => {
    setError('Failed to load PDF document');
    setIsLoading(false);
  };

  const handlePageRender = ({ pageNumber }: { pageNumber: number }) => {
    // Handle page render if needed
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
        scale={scale}
        contentRef={contentRef}
        onReady={handleReady}
        onLoadError={handleError}
        onPageRender={handlePageRender}
        showWhenLoading={
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        }
      />
    </div>
  );
};
