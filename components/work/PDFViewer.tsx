'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'pdfjs-dist/web/pdf_viewer.css';

// Add custom styles to improve the text layer appearance
const styles = `
  .textLayer {
    opacity: 0.2;
    line-height: 1.0;
    user-select: text;
  }
  .textLayer ::selection {
    background: rgba(0, 0, 255, 0.3);
  }
  .textLayer .highlight {
    background-color: rgba(180, 0, 170, 0.3);
  }
  .textLayer span {
    pointer-events: all;
    cursor: text;
  }
`;

interface Props {
  pdfUrl?: string;
  onReady?: ({ numPages }: { numPages: number }) => void;
  onLoadError?: (error: any) => void;
  showWhenLoading?: React.ReactNode;
  scale?: number;
  enableTextSelection?: boolean;
}

const PDFViewer = ({
  pdfUrl,
  onReady,
  onLoadError,
  showWhenLoading,
  scale = 1.0,
  enableTextSelection = false,
}: Props): React.ReactElement => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Add the custom styles to the document
    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    // Clean up on unmount
    return () => {
      document.head.removeChild(styleElement);
    };
  }, []);

  useEffect(() => {
    const loadPDF = async () => {
      if (!pdfUrl || !containerRef.current) return;

      try {
        setIsLoading(true);
        const pdfjs = await import('pdfjs-dist/webpack');
        // Import required components from PDF.js web viewer
        const pdfjsViewer = await import('pdfjs-dist/web/pdf_viewer');

        // Setup worker
        pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

        // Create an event bus for the viewer components
        const eventBus = new pdfjsViewer.EventBus();

        // Load the document
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;

        // Clear the container
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }

        // Tell the parent component we're ready
        onReady?.({ numPages: pdf.numPages });

        // Render each page
        for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
          const page = await pdf.getPage(pageNumber);
          const viewport = page.getViewport({ scale });

          // Create page container
          const pageContainer = document.createElement('div');
          pageContainer.className = 'pdf-page';
          pageContainer.style.position = 'relative';
          pageContainer.style.margin = '0 auto 16px auto';
          pageContainer.style.width = '100%';

          // Create a PDFPageView which handles text layer properly
          const pdfPageView = new pdfjsViewer.PDFPageView({
            container: pageContainer,
            id: pageNumber,
            scale,
            defaultViewport: viewport,
            eventBus,
            textLayerMode: enableTextSelection ? 1 : 0, // 1 = enabled, 0 = disabled
            // Render intent - display quality
            renderInteractiveForms: false,
          });

          // Set the PDF page for the view
          pdfPageView.setPdfPage(page);

          // Draw the page (this handles the canvas and text layer)
          await pdfPageView.draw();

          // Fix styling for text layer
          const textLayerDiv = pageContainer.querySelector('.textLayer');
          if (textLayerDiv) {
            // Add styles for better text selection
            textLayerDiv.setAttribute(
              'style',
              `
              position: absolute;
              left: 0;
              top: 0;
              right: 0;
              bottom: 0;
              overflow: hidden;
              line-height: 1.0;
              opacity: 0.2;
              text-align: initial;
              user-select: text;
              pointer-events: auto;
            `
            );
          }

          // Style the page div
          const pageDiv = pageContainer.querySelector('.page');
          if (pageDiv) {
            pageDiv.setAttribute('style', 'margin: 0 auto;');
          }

          // Add to container
          containerRef.current?.appendChild(pageContainer);
        }
      } catch (error) {
        console.error('Error loading PDF:', error);
        onLoadError?.(error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
  }, [pdfUrl, onReady, onLoadError, scale, enableTextSelection]);

  return (
    <div className="pdf-container">
      <div ref={containerRef} className="pdf-content" />
      {isLoading && showWhenLoading}
    </div>
  );
};

export default PDFViewer;
