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
 * 1. Progressive page rendering (pages appear as they load)
 * 2. Lazy loading with Intersection Observer (off-screen pages load on scroll)
 * 3. Zooming in/out
 * 4. Clickable annotation links
 * 5. Selectable and highlightable text via text layer
 * 6. High-DPI crisp rendering using devicePixelRatio scaling
 */
const PDFViewer = ({ url, onReady, onError }: PDFViewerProps) => {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pdfRef = useRef<any>(null);
  const loadingTaskRef = useRef<any>(null);
  const [scale, setScale] = useState(1);
  const [isRendering, setIsRendering] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Track which pages have been rendered to avoid duplicate work
  const renderedPagesRef = useRef<Set<number>>(new Set());
  // Track page placeholder elements for lazy loading
  const pagePlaceholdersRef = useRef<Map<number, HTMLDivElement>>(new Map());
  // Intersection observer for lazy loading
  const observerRef = useRef<IntersectionObserver | null>(null);
  // Track if onReady has been called
  const onReadyCalledRef = useRef(false);

  // How many pages to render immediately (before lazy loading kicks in)
  const INITIAL_PAGES_TO_RENDER = 3;

  // Inject text layer styles once
  useEffect(() => {
    if (document.getElementById('pdfjs-text-layer-style')) return;
    const style = document.createElement('style');
    style.id = 'pdfjs-text-layer-style';
    style.innerHTML = TEXT_LAYER_STYLE;
    document.head.appendChild(style);
  }, []);

  // Track whether we've already pointed PDF.js to its worker.
  const WORKER_CONFIGURED_FLAG = useRef(false);

  useEffect(() => {
    if (WORKER_CONFIGURED_FLAG.current) return;

    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${(pdfjsLib as any).version}/pdf.worker.min.js`;
    WORKER_CONFIGURED_FLAG.current = true;
  }, []);

  // Track a shared destroy promise across viewer instances
  let pdfDestroyInFlight: Promise<void> | null = null;

  // Render a single page into its placeholder - optimized for speed
  const renderPageIntoPlaceholder = useCallback(
    async (pageNumber: number, placeholder: HTMLDivElement, scaleFactor: number) => {
      const pdf = pdfRef.current;
      if (!pdf || renderedPagesRef.current.has(pageNumber)) return;

      // Mark as rendered immediately to prevent duplicate renders
      renderedPagesRef.current.add(pageNumber);

      try {
        const page = await pdf.getPage(pageNumber);
        const viewport = page.getViewport({ scale: scaleFactor });

        // Clear placeholder content (remove skeleton)
        placeholder.innerHTML = '';
        placeholder.style.height = 'auto';
        placeholder.style.minHeight = 'auto';

        // Create page container
        const pageContainer = document.createElement('div');
        pageContainer.className = 'relative flex justify-center';
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

        const renderContext = {
          canvasContext: context,
          viewport,
          transform: outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined,
        } as any;

        pageContainer.appendChild(canvas);
        placeholder.appendChild(pageContainer);

        // Render canvas first - this is the visual priority
        await page.render(renderContext).promise;

        // Call onReady after first page renders (user can see content!)
        if (!onReadyCalledRef.current) {
          onReadyCalledRef.current = true;
          onReady?.();
        }

        // Defer text layer and annotations to not block the visual render
        // Use requestIdleCallback if available, otherwise setTimeout
        const deferWork = (callback: () => void) => {
          if ('requestIdleCallback' in window) {
            (window as any).requestIdleCallback(callback, { timeout: 1000 });
          } else {
            setTimeout(callback, 50);
          }
        };

        deferWork(async () => {
          try {
            // Text layer div
            const textLayerDiv = document.createElement('div');
            textLayerDiv.className = 'textLayer';
            textLayerDiv.style.setProperty('--scale-factor', String(scaleFactor));
            pageContainer.appendChild(textLayerDiv);

            // Render the selectable text layer
            const textContent = await page.getTextContent();
            const { TextLayer } = (await import('pdfjs-dist/build/pdf.mjs')) as any;
            const textLayer = new TextLayer({
              container: textLayerDiv as HTMLDivElement,
              textContentSource: textContent,
              viewport,
            });
            await textLayer.render();

            // Handle link annotations
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
          } catch {
            /* text layer is non-critical, ignore errors */
          }
        });
      } catch (err) {
        // Page render failed, allow retry
        renderedPagesRef.current.delete(pageNumber);
        console.error(`Failed to render page ${pageNumber}:`, err);
      }
    },
    [onReady]
  );

  // Create placeholders for all pages and set up lazy loading
  const setupDocument = useCallback(
    async (pdf: any, scaleFactor: number) => {
      const container = containerRef.current;
      if (!container) return;

      setIsRendering(true);
      container.innerHTML = '';
      renderedPagesRef.current.clear();
      pagePlaceholdersRef.current.clear();
      onReadyCalledRef.current = false;

      // Disconnect existing observer
      if (observerRef.current) {
        observerRef.current.disconnect();
      }

      const totalPages = pdf.numPages;

      // Get first page to estimate dimensions for placeholders
      const firstPage = await pdf.getPage(1);
      const defaultViewport = firstPage.getViewport({ scale: scaleFactor });
      const estimatedHeight = defaultViewport.height;
      const estimatedWidth = defaultViewport.width;

      // Create placeholders for ALL pages immediately (lightweight)
      for (let pageNumber = 1; pageNumber <= totalPages; pageNumber++) {
        const placeholder = document.createElement('div');
        placeholder.className = 'relative mb-6 last:mb-0 flex justify-center items-center';
        placeholder.style.minHeight = `${estimatedHeight}px`;
        placeholder.style.width = `${estimatedWidth}px`;
        placeholder.dataset.pageNumber = String(pageNumber);

        // Add a subtle skeleton loader
        const skeleton = document.createElement('div');
        skeleton.className = 'absolute inset-0 bg-gray-100 animate-pulse rounded';
        placeholder.appendChild(skeleton);

        container.appendChild(placeholder);
        pagePlaceholdersRef.current.set(pageNumber, placeholder);
      }

      // Render initial pages immediately (no waiting for intersection)
      const initialRenderPromises: Promise<void>[] = [];
      for (let i = 1; i <= Math.min(INITIAL_PAGES_TO_RENDER, totalPages); i++) {
        const placeholder = pagePlaceholdersRef.current.get(i);
        if (placeholder) {
          initialRenderPromises.push(renderPageIntoPlaceholder(i, placeholder, scaleFactor));
        }
      }

      // Wait for initial pages to render before hiding main loader
      await Promise.all(initialRenderPromises);
      setIsRendering(false);

      // Set up Intersection Observer for lazy loading remaining pages
      observerRef.current = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const pageNumber = parseInt(
                (entry.target as HTMLElement).dataset.pageNumber || '0',
                10
              );
              if (pageNumber > 0 && !renderedPagesRef.current.has(pageNumber)) {
                const placeholder = pagePlaceholdersRef.current.get(pageNumber);
                if (placeholder) {
                  renderPageIntoPlaceholder(pageNumber, placeholder, scaleFactor);
                }
              }
            }
          });
        },
        {
          root: null, // viewport
          rootMargin: '200px 0px', // Start loading 200px before visible
          threshold: 0,
        }
      );

      // Observe all placeholders (except already rendered initial pages)
      for (let pageNumber = INITIAL_PAGES_TO_RENDER + 1; pageNumber <= totalPages; pageNumber++) {
        const placeholder = pagePlaceholdersRef.current.get(pageNumber);
        if (placeholder) {
          observerRef.current.observe(placeholder);
        }
      }
    },
    [renderPageIntoPlaceholder]
  );

  // Load document when URL changes
  useEffect(() => {
    let destroyed = false;

    (async () => {
      // Wait for any previous destroy() to finish
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
          // available width of the container.
          (async () => {
            try {
              const firstPage = await pdfDoc.getPage(1);
              const viewport = firstPage.getViewport({ scale: 1 });
              const containerWidth = containerRef.current?.clientWidth || viewport.width;
              let fitScale = containerWidth / viewport.width;

              // On mobile, enforce a minimum scale so text remains readable
              const isMobile = containerWidth < 640;
              const MIN_MOBILE_SCALE = 1.0;
              if (isMobile && fitScale < MIN_MOBILE_SCALE) {
                fitScale = MIN_MOBILE_SCALE;
              }

              const newScale = parseFloat(fitScale.toFixed(2));
              if (Math.abs(newScale - scale) > 0.01) {
                setScale(newScale);
                // setupDocument will be called by the scale change effect
                return;
              }
            } catch {
              /* fall back to default scale */
            }

            // Fallback: setup at the current scale
            setupDocument(pdfDoc, scale);
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

      // Disconnect observer
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }

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
      setupDocument(pdfRef.current, scale);
    }
  }, [scale, setupDocument]);

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
