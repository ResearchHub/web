/*
 * WARNING 1: Do not use this component directly.
 * Use DocumentViewer component instead since it is capable of properly loading it.
 * Failure to do so, will result in a very large bundle size.
 *
 * WARNING 2: Refrain from modifying the HTML structure of this component.
 * Rendering annotations uses xpath and if this component's structure is modified, it may result
 * in orphaned annotations which we are unable to render.
 * Adding a mechanism to find and re-attach orphaned annotations is possible but not trivial.
 */

'use client';

import React, { useEffect, useRef, useState } from 'react';
import 'pdfjs-dist/web/pdf_viewer.css';

interface Props {
  pdfUrl?: string;
  scale?: number;
  onReady?: ({ numPages }: { numPages: number }) => void;
  onLoadError?: (error: any) => void;
  showWhenLoading?: React.ReactNode;
}

const PDFViewer = ({
  pdfUrl,
  scale = 1.0,
  onReady,
  onLoadError,
  showWhenLoading,
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

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          const pageContainer = document.createElement('div');
          pageContainer.className = 'pdf-page';
          pageContainer.style.cssText =
            'position: relative; margin: 0 auto 16px auto; max-width: 600px;';

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          if (!context) continue;

          canvas.width = viewport.width;
          canvas.height = viewport.height;
          canvas.style.cssText = 'width: 100%; height: auto; display: block;';

          pageContainer.appendChild(canvas);
          containerRef.current.appendChild(pageContainer);

          await page.render({
            canvasContext: context,
            viewport,
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
  }, [pdfUrl, scale, onReady, onLoadError]);

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        padding: '24px',
        backgroundColor: '#f5f5f5',
      }}
    >
      <div
        ref={containerRef}
        style={{
          width: '100%',
          background: 'white',
          borderRadius: '8px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          padding: '16px',
        }}
      />
      {isLoading && showWhenLoading}
    </div>
  );
};

export default PDFViewer;
