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

import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';

interface Page {
  pdfPageView: any;
  pageNumber: number;
  pageContainer: HTMLDivElement;
}

interface Props {
  pdfUrl?: string;
  viewerWidth?: number;
  contentRef: any;
  numPagesToPreload?: number | 'all';
  showWhenLoading?: React.ReactNode;
  scale: number;
  onReady?: ({ numPages }: { numPages: number }) => void;
  onLoadError: (error: any) => void;
  onPageRender: ({ pageNumber }: { pageNumber: number }) => void;
}

const PDFViewer = ({
  pdfUrl,
  showWhenLoading,
  onReady,
  numPagesToPreload = 5,
  onLoadError,
  onPageRender,
  viewerWidth = 860,
  contentRef,
  scale,
}: Props): React.ReactElement => {
  // Move PDF.js imports inside the component to ensure they're only loaded on the client
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfViewer, setPdfViewer] = useState<any>(null);

  useEffect(() => {
    // Dynamically import PDF.js only on the client side
    const loadPdfjs = async () => {
      try {
        // Use the prebuilt version that doesn't require canvas
        const { getDocument, GlobalWorkerOptions, version } = await import('pdfjs-dist/webpack');
        const { PDFPageView, EventBus } = await import('pdfjs-dist/web/pdf_viewer');

        // Use the prebuilt worker from CDN
        GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${version}/pdf.worker.min.js`;

        setPdfjs({ getDocument });
        setPdfViewer({ PDFPageView, EventBus });
      } catch (error) {
        console.error('Failed to load PDF.js:', error);
        onLoadError?.(error);
      }
    };
    loadPdfjs();
  }, [onLoadError]);

  const viewerWidthRef = useRef<number>(viewerWidth);
  const scaleRef = useRef<number>(scale);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isReadyToRender, setIsReadyToRender] = useState<boolean>(false);
  const [numPages, setNumPages] = useState<number>(0);
  const [pdfDocument, setPdfDocument] = useState<any>(null);
  const [nextPage, setNextPage] = useState<number>(1);
  const [pagesLoading, setPagesLoading] = useState<number[]>([]);
  const pagesLoadingRef = useRef<number[]>([]);
  const [pageBuffer, setPageBuffer] = useState<{ [pageNumber: number]: Page }>({});
  const [renderedPages, setRenderedPages] = useState<{ [pageNumber: number]: Page }>({});
  const renderedPagesRef = useRef<{ [pageNumber: number]: Page }>({});
  const observer = useRef<IntersectionObserver | null>(null);
  const eventBus = useRef<any>(null);

  // Initialize EventBus when pdfViewer is loaded
  useEffect(() => {
    if (pdfViewer) {
      eventBus.current = new pdfViewer.EventBus();
    }
  }, [pdfViewer]);

  // Store destinations for internal links (e.g. anchors)
  const internalLinkDestinations = useRef<{ [key: string]: any }>({});

  useEffect(() => {
    renderedPagesRef.current = renderedPages;
  }, [renderedPages]);

  const scrollToDestination = useCallback(
    async (destination: any) => {
      if (destination === null || destination === undefined) return;

      if (typeof destination === 'number') {
        // Simple case: destination is a page number
        const targetPageNumber = destination;
        if (targetPageNumber >= 1 && targetPageNumber <= numPages) {
          // Logic to scroll to the top of the target page
          const pageToScroll = (renderedPagesRef.current || {})[targetPageNumber]?.pageContainer;
          if (pageToScroll) {
            pageToScroll.scrollIntoView({ behavior: 'smooth' });
          }
        }
      } else if (Array.isArray(destination)) {
        // destination is an array of page/coordinate details
        const objectNumber = destination[0].num;
        const generationNumber = destination[0].gen;
        try {
          const pageNumber =
            (await pdfDocument.getPageIndex({
              num: objectNumber,
              gen: generationNumber,
            })) + 1; // getPageIndex is zero-based
          if (pageNumber >= 1 && pageNumber <= numPages) {
            const pageContainer = (renderedPagesRef.current || {})[pageNumber]?.pageContainer;
            if (pageContainer) {
              pageContainer.scrollIntoView({ behavior: 'smooth' });
            }
          }
        } catch (error) {
          console.log('error navigating to destination', error);
        }
      } else {
        // it's a named destination that we need to look up in the document
        scrollToNamedDestination(destination);
      }
    },
    [numPages, pdfDocument]
  );

  const scrollToNamedDestination = useCallback(
    async (namedDestination: string) => {
      try {
        const resolvedDestination = await pdfDocument.getDestination(namedDestination);
        if (resolvedDestination) {
          scrollToDestination(resolvedDestination);
        }
      } catch (error) {
        console.log('error navigating to named destination', error);
      }
    },
    [pdfDocument, scrollToDestination]
  );

  const loadPage = useCallback(
    async (pageNumber: number) => {
      if (!pdfDocument || !pdfViewer) return;

      setPagesLoading((prevPagesLoading) => {
        if (prevPagesLoading.includes(pageNumber)) {
          pagesLoadingRef.current = prevPagesLoading;
          return prevPagesLoading;
        }

        pagesLoadingRef.current = [...prevPagesLoading, pageNumber];
        return [...prevPagesLoading, pageNumber];
      });

      const page = await pdfDocument.getPage(pageNumber);
      const viewport = page.getViewport({ scale: scaleRef.current });
      const pageContainer = document.createElement('div') as HTMLDivElement;
      pageContainer.style.position = 'relative';

      const pdfPageView = new pdfViewer.PDFPageView({
        container: pageContainer,
        id: pageNumber,
        scale: scaleRef.current,
        defaultViewport: viewport,
        eventBus: eventBus.current,
        textLayerMode: 1,
      });

      pdfPageView.setPdfPage(page);
      await pdfPageView.draw();

      // Setup links to internal destinations (e.g. link to a specific citation or figure/table)
      const annotations = await page.getAnnotations();
      const internalLinks = annotations.filter(
        (ann: { subtype: string; url?: string }) => ann.subtype === 'Link' && ann.url === undefined
      );
      internalLinks.forEach((link: { dest: any }, index: number) => {
        const destination = link.dest;
        internalLinkDestinations.current[`internal-link-${pageNumber}-${index}`] = destination;
      });

      const pageDiv = pageContainer.querySelector('.page') as HTMLDivElement;
      const annotationsDiv = pageContainer.querySelector('.annotationLayer') as HTMLDivElement;

      if (pageDiv) pageDiv.style.margin = '0 auto';
      if (annotationsDiv) {
        annotationsDiv.style.display = 'block';
        annotationsDiv.style.left = 'unset';

        // Setup internal and external links
        const links = annotationsDiv.getElementsByTagName('a');
        for (let index = 0; index < links.length; index++) {
          const link = links[index];
          if (link.href === '#' || link.href.endsWith('#')) {
            // it's an internal link
            const linkKey = `internal-link-${pageNumber}-${index}`;
            link.addEventListener('click', (event) => {
              event.preventDefault();
              const destination = internalLinkDestinations.current[linkKey];
              scrollToDestination(destination);
            });
          } else {
            // it's an external link
            link.target = '_blank';
          }
        }
      }

      const textLayerDiv = pageContainer.querySelector('.textLayer') as HTMLDivElement;
      if (textLayerDiv) {
        textLayerDiv.id = `textLayer-page-${pageNumber}`;
        textLayerDiv.style.margin = '0 auto';
      }

      setPageBuffer((prevPageBuffer) => ({
        ...prevPageBuffer,
        [pageNumber]: { pdfPageView, pageNumber, pageContainer },
      }));

      setPagesLoading((prevPagesLoading) => prevPagesLoading.filter((page) => page !== pageNumber));
    },
    [pdfDocument, pdfViewer]
  );

  useEffect(() => {
    const loadDocument = async () => {
      if (!pdfjs || !pdfUrl) return;

      try {
        const loadingTask = pdfjs.getDocument(pdfUrl);
        const doc = await loadingTask.promise;
        setPdfDocument(doc);
        setNumPages(doc.numPages);
        onReady?.({ numPages: doc.numPages });
      } catch (error) {
        onLoadError?.(error);
        console.log('error loading pdf', error);
      }
    };

    loadDocument();
  }, [pdfjs, pdfUrl, onReady, onLoadError]);

  useLayoutEffect(() => {
    function updateWidth() {
      setIsReadyToRender(true);
    }

    window.addEventListener('resize', updateWidth);
    updateWidth();
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  useEffect(() => {
    const isPageAlreadyLoadedOrLoading =
      pageBuffer[nextPage] || pagesLoadingRef.current.includes(nextPage);

    if (nextPage <= numPages && isReadyToRender && !isPageAlreadyLoadedOrLoading) {
      loadPage(nextPage);
    }
  }, [nextPage, loadPage, numPages, isReadyToRender]);

  useEffect(() => {
    if (scale !== scaleRef.current) {
      scaleRef.current = scale;
      viewerWidthRef.current = viewerWidth;

      const redrawPagePromises = Object.keys(renderedPages).map(async (pageNumber: string) => {
        const page = renderedPages[parseInt(pageNumber)];
        page.pdfPageView.update({ scale: scaleRef.current });
        await page.pdfPageView.draw();
        onPageRender({ pageNumber: parseInt(pageNumber) });
      });

      Promise.all(redrawPagePromises).then(() => {
        setPagesLoading([]);
      });
    }
  }, [scale, viewerWidth, renderedPages, onPageRender]);

  useEffect(() => {
    if (pageBuffer[nextPage]) {
      const page = pageBuffer[nextPage];
      if (containerRef.current) {
        containerRef.current.appendChild(page.pageContainer);
      }
      const { [nextPage]: _, ...newPageBuffer } = pageBuffer;
      setPageBuffer(newPageBuffer);

      setRenderedPages((prevRenderedPages) => ({
        ...prevRenderedPages,
        [nextPage]: page,
      }));

      if (numPagesToPreload === 'all') {
        if (nextPage < numPages) {
          setNextPage((prevNextPage) => prevNextPage + 1);
        }
      } else if (nextPage <= numPagesToPreload) {
        setNextPage((prevNextPage) => prevNextPage + 1);
      }

      setTimeout(() => {
        onPageRender({ pageNumber: nextPage });
      }, 0);

      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && nextPage < numPages) {
            setNextPage(nextPage + 1);
          }
        },
        {
          rootMargin: '-10px',
        }
      );
      observer.current.observe(page.pageContainer);
    }
  }, [pageBuffer, nextPage, numPages, numPagesToPreload, onPageRender]);

  return (
    <div style={{ position: 'relative', width: viewerWidthRef.current }} ref={contentRef}>
      <div
        ref={containerRef}
        style={{
          boxSizing: 'border-box',
        }}
      />
      {(pagesLoading.length > 0 || !isReadyToRender || !pdfjs || !pdfViewer) && showWhenLoading}
    </div>
  );
};

export default PDFViewer;
