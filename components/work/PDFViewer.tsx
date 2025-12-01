'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist/webpack';
// Note: TextLayer is not typed in the shipped pdfjs-dist types yet, so we load it dynamically.
import { Minus, Plus, Maximize2, Minimize2 } from 'lucide-react';

// Minimal CSS for PDF.js text layer to enable selectable text and proper layout
const TEXT_LAYER_STYLE = `
  .textLayer {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    color: transparent;
    line-height: 1;
    user-select: text;
  }
  .textLayer span {
    position: absolute;
    white-space: pre;
    transform-origin: 0% 0%;
  }
  .textLayer .endOfContent {
    display: none;
  }
`;

interface PDFViewerProps {
  url: string;
  onReady?: () => void;
  onError?: (error: any) => void;
}

/**
 * Lightweight PDF viewer built with PDF.js that supports
 * 1. Rendering pages sequentially
 * 2. Zooming in/out
 * 3. Clickable annotation links
 * 4. Selectable and highlightable text via text layer
 * 5. High-DPI crisp rendering using devicePixelRatio scaling
 */
const PDFViewer = ({ url, onReady, onError }: PDFViewerProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Limit how many pages are rendered in parallel to avoid main-thread
  // starvation yet still utilize CPU cores better than purely sequential
  // rendering. Tune this constant based on typical device capabilities –
  // 4 provides a good balance for modern laptops/desktops while still
  // keeping memory usage reasonable.
  const MAX_CONCURRENT_PAGE_RENDER = 4;

  // Inject text layer styles once
  useEffect(() => {
    if (document.getElementById('pdfjs-text-layer-style')) return;
    const style = document.createElement('style');
    style.id = 'pdfjs-text-layer-style';
    style.innerHTML = TEXT_LAYER_STYLE;
    document.head.appendChild(style);
  }, []);

  // Track whether we've already pointed PDF.js to its worker. Mutating the
  // pdfjs-dist *module namespace* directly (e.g. `pdfjsLib._workerConfigured`)
  // isn't allowed in ESM — it leads to "Attempted import error" messages in
  // Next.js. Instead we keep the flag in a local variable that lives for the
  // lifetime of the module instance (one per browser tab).
  const WORKER_CONFIGURED_FLAG = useRef(false);

  useEffect(() => {
    if (WORKER_CONFIGURED_FLAG.current) return;

    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;
    WORKER_CONFIGURED_FLAG.current = true;
  }, []);

  // Track a shared destroy promise across viewer instances to avoid triggering
  // pdfjs race conditions where a new `getDocument` is called while a previous
  // one's `destroy()` is still in-flight (see pdf.js issue #16777).
  let pdfDestroyInFlight: Promise<void> | null = null;

  // Utility to render a single page
  const renderPage = useCallback(async (page: any, scaleFactor: number) => {
    const viewport = page.getViewport({ scale: scaleFactor });
    const pageContainer = document.createElement('div');
    pageContainer.className = 'relative mb-6 last:mb-0 flex justify-center';
    pageContainer.style.width = `${viewport.width}px`;

    // Canvas for main raster layer
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    const outputScale = window.devicePixelRatio || 1;
    canvas.width = viewport.width * outputScale;
    canvas.height = viewport.height * outputScale;
    canvas.style.width = `${viewport.width}px`;
    canvas.style.height = `${viewport.height}px`;

    // Prepare render task with scaling transform for HiDPI
    const renderContext = {
      canvasContext: context,
      viewport,
      transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
    } as any;

    pageContainer.appendChild(canvas);

    // Text layer div
    const textLayerDiv = document.createElement('div');
    textLayerDiv.className = 'textLayer';
    // Required by pdf.js 4+: ensures correct positioning when the viewport is
    // scaled. Without this the text layer is slightly mis-aligned.
    textLayerDiv.style.setProperty('--scale-factor', String(scaleFactor));
    pageContainer.appendChild(textLayerDiv);

    if (containerRef.current) {
      containerRef.current.appendChild(pageContainer);
    }

    // Render the main layer
    await page.render(renderContext).promise;

    // Render the selectable text layer
    const textContent = await page.getTextContent();
    // Dynamically import TextLayer to avoid type resolution issues in TS
    const { TextLayer } = (await import('pdfjs-dist/build/pdf.mjs')) as any;
    const textLayer = new TextLayer({
      container: textLayerDiv as HTMLDivElement,
      textContentSource: textContent,
      viewport,
    });
    await textLayer.render();

    // Handle link annotations to make them clickable
    const annotations = await page.getAnnotations();
    annotations.forEach((annot: any) => {
      if (annot.subtype === 'Link' && !!annot.url) {
        const linkEl = document.createElement('a');
        linkEl.href = annot.url;
        linkEl.target = '_blank';
        linkEl.rel = 'noopener noreferrer';
        linkEl.style.position = 'absolute';
        const rect = (pdfjsLib as any).Util.normalizeRect(annot.rect);
        const [x1, y1, x2, y2] = viewport.convertToViewportRectangle(rect);
        const left = Math.min(x1, x2);
        const top = Math.min(y1, y2);
        const width = Math.abs(x1 - x2);
        const height = Math.abs(y1 - y2);
        linkEl.style.left = `${left}px`;
        linkEl.style.top = `${top}px`;
        linkEl.style.width = `${width}px`;
        linkEl.style.height = `${height}px`;
        linkEl.style.cursor = 'pointer';
        linkEl.style.background = 'rgba(0,0,0,0)';
        pageContainer.appendChild(linkEl);
      }
    });
  }, []);

  // Render or re-render the entire document
  const renderDocument = useCallback(async () => {
    const pdf = pdfRef.current;
    const container = containerRef.current;
    if (!pdf || !container) return;

    setIsRendering(true);
    container.innerHTML = '';

    const totalPages = pdf.numPages;
    const inFlight: Promise<void>[] = [];

    for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
      // Kick off page retrieval + rendering immediately
      const pagePromise = pdf.getPage(pageNumber).then((page: any) => renderPage(page, scale));

      inFlight.push(pagePromise);

      // When we reach the concurrency limit, wait for all current tasks
      // before continuing. This throttles work while still allowing the
      // browser to parallelize expensive rasterization operations across
      // multiple threads/cores.
      if (inFlight.length >= MAX_CONCURRENT_PAGE_RENDER) {
        await Promise.all(inFlight);
        inFlight.length = 0; // reset array without reallocating
      }
    }

    // Await any leftover pages that didn't fill the final batch.
    if (inFlight.length) {
      await Promise.all(inFlight);
    }
    setIsRendering(false);
    onReady?.();
  }, [scale, onReady, renderPage]);

  // Load document when URL changes
  useEffect(() => {
    let destroyed = false;

    (async () => {
      // Wait for any previous destroy() to finish (hot-reload or tab change).
      if (pdfDestroyInFlight) {
        try {
          await pdfDestroyInFlight;
        } catch {
          /* ignore */
        }
        pdfDestroyInFlight = null;
      }

      const loadingTask = pdfjsLib.getDocument(url);
      loadingTaskRef.current = loadingTask;

      loadingTask.promise
        .then((pdfDoc: any) => {
          if (destroyed) return;
          pdfRef.current = pdfDoc;

          // Auto-fit: compute a scale factor so the first page fills the
          // available width of the container. This gives a nicer default view
          // than a hard-coded 100 %.
          (async () => {
            try {
              const firstPage = await pdfDoc.getPage(1);
              const viewport = firstPage.getViewport({ scale: 1 });
              const containerWidth = containerRef.current?.clientWidth || viewport.width;
              let fitScale = containerWidth / viewport.width;

              // On mobile (narrow screens), enforce a minimum scale so text
              // remains readable. Users can scroll horizontally if needed.
              const isMobile = containerWidth < 640;
              const MIN_MOBILE_SCALE = 1.0;
              if (isMobile && fitScale < MIN_MOBILE_SCALE) {
                fitScale = MIN_MOBILE_SCALE;
              }

              // Only apply if it differs meaningfully from the default to avoid
              // triggering an unnecessary re-render when it's already a good
              // fit (e.g. small pages).
              if (Math.abs(fitScale - 1) > 0.01) {
                setScale(parseFloat(fitScale.toFixed(2))); // keep nice rounding
                return; // renderDocument will be invoked by the scale change
              }
            } catch {
              /* fall back to default scale */
            }

            // Fallback: render at the current (default) scale.
            renderDocument();
          })();
        })
        .catch((err: any) => {
          if (!destroyed) {
            onError?.(err);
          }
        });
    })();

    return () => {
      destroyed = true;
      // Clean up rendered document
      if (pdfRef.current) {
        pdfRef.current.destroy();
        pdfRef.current = null;
      }

      // Await destruction in shared promise so next mount waits.
      if (loadingTaskRef.current) {
        pdfDestroyInFlight = loadingTaskRef.current.destroy().catch(() => {});
        loadingTaskRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url]);

  // Re-render when scale changes
  useEffect(() => {
    if (pdfRef.current) {
      renderDocument();
    }
  }, [scale, renderDocument]);

  // Zoom handlers
  const zoomIn = () => setScale((prev) => Math.min(prev + 0.25, 3));
  const zoomOut = () => setScale((prev) => Math.max(prev - 0.25, 0.5));

  // Fullscreen change handler
  useEffect(() => {
    const handleFsChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFsChange);
    return () => document.removeEventListener('fullscreenchange', handleFsChange);
  }, []);

  const toggleFullscreen = () => {
    const elem = rootRef.current;
    if (!elem) return;
    if (!document.fullscreenElement) {
      elem.requestFullscreen().catch(() => {
        /* ignore */
      });
    } else {
      document.exitFullscreen().catch(() => {
        /* ignore */
      });
    }
  };

  return (
    <div
      ref={rootRef}
      className={`${isFullscreen ? 'fixed inset-0 z-50 bg-white overflow-y-auto' : 'relative'} w-full`}
      style={
        isFullscreen
          ? { display: 'flex', flexDirection: 'column', alignItems: 'center' }
          : undefined
      }
    >
      {/* Zoom controls */}
      <div
        className="absolute top-2 right-2 bg-gradient-to-b from-white to-gray-100 backdrop-blur-md rounded-md border border-gray-300 shadow-xl p-0.5 flex items-center z-20 select-none"
        style={{
          boxShadow:
            '0 2px 4px rgba(0,0,0,0.1), inset 0 1px 0 white, inset 0 -2px 0 rgba(0,0,0,0.05)',
        }}
      >
        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 hover:bg-gray-100 rounded-l disabled:opacity-50"
          aria-label={isFullscreen ? 'Exit full screen' : 'Enter full screen'}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </button>

        {/* Zoom out */}
        <button
          onClick={zoomOut}
          className="p-2 hover:bg-gray-100 disabled:opacity-50"
          disabled={scale <= 0.5 || isRendering}
          aria-label="Zoom out"
        >
          <Minus className="h-4 w-4" />
        </button>
        <span className="px-3 text-sm font-medium tabular-nums w-14 text-center">
          {Math.round(scale * 100)}%
        </span>
        {/* Zoom in */}
        <button
          onClick={zoomIn}
          className="p-2 hover:bg-gray-100 rounded-r disabled:opacity-50"
          disabled={scale >= 3 || isRendering}
          aria-label="Zoom in"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {/* PDF pages container */}
      <div
        ref={containerRef}
        className="pdf-pages-wrapper flex flex-col items-center overflow-x-auto"
      />
    </div>
  );
};

export default PDFViewer;
