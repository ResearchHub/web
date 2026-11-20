'use client';

import {
  Fragment,
  type MouseEvent,
  type PointerEvent,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { X } from 'lucide-react';
import { cn } from '@/utils/styles';

export interface LightboxImage {
  src: string;
  alt: string;
}

interface ImageLightboxProps {
  isOpen: boolean;
  /** Kept while the lightbox fades out, so the image doesn't vanish first. */
  image: LightboxImage | null;
  onClose: () => void;
}

/** How much a tap on the image enlarges it, from its size fitted to the screen. */
const ZOOM = 2.5;

/** How far, in pixels, a mouse press on the zoomed image moves before it pans instead of clicks. */
const PAN_THRESHOLD = 4;

/**
 * One image over the whole screen, as large as fits it. A phone's image
 * already spans the page, so a tap on it zooms in further, kept under the
 * finger, and the zoomed image pans; another tap fits it again. A mouse drags
 * the zoomed image to pan it, rather than dragging out a copy of it. A tap
 * beside it, the close button or Escape closes the lightbox.
 */
export function ImageLightbox({ isOpen, image, onClose }: ImageLightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomedWidth, setZoomedWidth] = useState<number | null>(null);
  // Where the tap landed, as a share of the image and on the screen, to scroll back under it.
  const focusRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null);
  // Where a mouse press on the zoomed image started, and the scroll it started from.
  const panRef = useRef<{ x: number; y: number; left: number; top: number } | null>(null);
  // Whether the current press has panned, so the click it ends in neither zooms nor closes.
  const pannedRef = useRef(false);
  const [isPanning, setIsPanning] = useState(false);

  // Each time it opens, the image opens fitted. Closing leaves the zoom as it
  // is, so the image fades out where it was instead of jumping back first.
  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setZoomedWidth(null);
      setIsPanning(false);
    }
  }

  useLayoutEffect(() => {
    const scroller = scrollRef.current;
    const focus = focusRef.current;
    if (!scroller || !focus || zoomedWidth === null) return;
    const img = scroller.querySelector('img');
    if (!img) return;
    const rect = img.getBoundingClientRect();
    scroller.scrollLeft += rect.left + focus.x * rect.width - focus.clientX;
    scroller.scrollTop += rect.top + focus.y * rect.height - focus.clientY;
    focusRef.current = null;
  }, [zoomedWidth]);

  const isZoomed = zoomedWidth !== null;

  const toggleZoom = (event: MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
    if (pannedRef.current) return;
    if (isZoomed) {
      setZoomedWidth(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    focusRef.current = {
      x: (event.clientX - rect.left) / rect.width,
      y: (event.clientY - rect.top) / rect.height,
      clientX: event.clientX,
      clientY: event.clientY,
    };
    setZoomedWidth(rect.width * ZOOM);
  };

  // A finger pans the zoomed image by scrolling it; a mouse needs this.
  const startPan = (event: PointerEvent<HTMLImageElement>) => {
    const scroller = scrollRef.current;
    if (!isZoomed || !scroller || event.pointerType !== 'mouse' || event.button !== 0) return;
    // Captured, the press keeps panning when the pointer leaves the image.
    event.currentTarget.setPointerCapture(event.pointerId);
    panRef.current = {
      x: event.clientX,
      y: event.clientY,
      left: scroller.scrollLeft,
      top: scroller.scrollTop,
    };
  };

  const pan = (event: PointerEvent<HTMLImageElement>) => {
    const start = panRef.current;
    const scroller = scrollRef.current;
    // With no button down, the image missed the release, as when Escape closed it mid-pan.
    if (!start || !scroller || event.buttons === 0) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (!pannedRef.current) {
      if (Math.hypot(dx, dy) < PAN_THRESHOLD) return;
      pannedRef.current = true;
      setIsPanning(true);
    }
    scroller.scrollLeft = start.left - dx;
    scroller.scrollTop = start.top - dy;
  };

  // A pan ends when the image loses the capture, as releasing the button or a cancelled press both make it.
  const endPan = () => {
    panRef.current = null;
    setIsPanning(false);
  };

  // Every press starts out as a click, and becomes a pan once it moves.
  const resetPan = () => {
    panRef.current = null;
    pannedRef.current = false;
  };

  const handleBackdropClick = () => {
    if (!pannedRef.current) onClose();
  };

  return (
    <Transition show={isOpen && !!image} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black" aria-hidden="true" />
        </Transition.Child>

        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="fixed inset-0">
            <Dialog.Title className="sr-only">{image?.alt || 'Image'}</Dialog.Title>
            <div
              ref={scrollRef}
              onPointerDownCapture={resetPan}
              className={cn('h-full w-full', isZoomed ? 'overflow-auto' : 'overflow-hidden')}
            >
              {/* A tap beside the image closes; the image itself zooms. */}
              <div
                onClick={handleBackdropClick}
                className={cn(
                  'flex cursor-zoom-out select-none items-center justify-center p-4 sm:p-10',
                  isZoomed ? 'min-h-full min-w-full w-max' : 'h-full w-full'
                )}
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.src}
                    alt={image.alt}
                    draggable={false}
                    onClick={toggleZoom}
                    onPointerDown={startPan}
                    onPointerMove={pan}
                    onLostPointerCapture={endPan}
                    style={isZoomed ? { width: zoomedWidth } : undefined}
                    className={cn(
                      'rounded-sm',
                      isZoomed
                        ? cn(
                            'h-auto max-w-none shrink-0',
                            isPanning ? 'cursor-grabbing' : 'cursor-zoom-out'
                          )
                        : 'max-h-full max-w-full cursor-zoom-in object-contain'
                    )}
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close image"
              className="absolute right-3 top-[max(0.75rem,env(safe-area-inset-top))] rounded-full bg-white/15 p-2 text-white transition-colors hover:bg-white/25"
            >
              <X className="h-6 w-6" aria-hidden="true" />
            </button>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
}
