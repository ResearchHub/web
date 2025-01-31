'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'pdfjs-dist/web/pdf_viewer.css';

interface Props {
  pdfUrl?: string;
  onReady?: ({ numPages }: { numPages: number }) => void;
  onLoadError?: (error: any) => void;
  showWhenLoading?: React.ReactNode;
  scale?: number;
}

const PDFViewer = ({
  pdfUrl,
  onReady,
  onLoadError,
  showWhenLoading,
  scale = 1.0,
}: Props): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfUrl || !containerRef.current) return;

      try {
        setIsLoading(true);
        const pdfjs = await import('pdfjs-dist/webpack');
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        const pdf = await pdfjs.getDocument(pdfUrl).promise;
        onReady?.({ numPages: pdf.numPages });
        containerRef.current.innerHTML = '';

        // Pre-load all pages first
        const pages = await Promise.all(
          Array.from({ length: pdf.numPages }, (_, i) => pdf.getPage(i + 1))
        );

        // Calculate the optimal scale based on the first page
        const defaultViewport = pages[0].getViewport({ scale: 1.0 });
        const containerWidth = containerRef.current.clientWidth - 32; // Subtract padding
        const scale = Math.min(3.0, containerWidth / defaultViewport.width);

        // Create a container div to hold all pages
        const pagesContainer = document.createElement('div');
        containerRef.current.appendChild(pagesContainer);

        // Render pages one by one in sequence
        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
          const viewport = page.getViewport({ scale });

          // Create page container
          const pageContainer = document.createElement('div');
          pageContainer.className = 'pdf-page';
          pageContainer.style.cssText =
            'position: relative; margin: 0 auto 16px auto; width: 100%;';

          // Create canvas
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d', { alpha: false });
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.cssText = 'width: 100%; height: auto; display: block;';

          // Add canvas to page container
          pageContainer.appendChild(canvas);
          pagesContainer.appendChild(pageContainer);

          // Render the page - wait for completion before moving to next page
          await page.render({
            canvasContext: context,
            viewport,
            intent: 'display',
          }).promise;
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        onLoadError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl, onReady, onLoadError]);

  return (
    <div>
      <div ref={containerRef} />
      {isLoading && showWhenLoading}
    </div>
  );
};

export default PDFViewer;
