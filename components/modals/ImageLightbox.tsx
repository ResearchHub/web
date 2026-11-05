'use client';

import { Fragment, type MouseEvent, useLayoutEffect, useRef, useState } from 'react';
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

/**
 * One image over the whole screen, as large as fits it. A phone's image
 * already spans the page, so a tap on it zooms in further, kept under the
 * finger, and the zoomed image pans; another tap fits it again. A tap beside
 * it, the close button or Escape closes the lightbox.
 */
export function ImageLightbox({ isOpen, image, onClose }: ImageLightboxProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [zoomedWidth, setZoomedWidth] = useState<number | null>(null);
  // Where the tap landed, as a share of the image and on the screen, to scroll back under it.
  const focusRef = useRef<{ x: number; y: number; clientX: number; clientY: number } | null>(null);

  // Each image opens fitted.
  const [shownSrc, setShownSrc] = useState(image?.src);
  if (image?.src !== shownSrc) {
    setShownSrc(image?.src);
    setZoomedWidth(null);
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

  const toggleZoom = (event: MouseEvent<HTMLImageElement>) => {
    event.stopPropagation();
    if (zoomedWidth !== null) {
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

  const handleClose = () => {
    setZoomedWidth(null);
    onClose();
  };

  const isZoomed = zoomedWidth !== null;

  return (
    <Transition show={isOpen && !!image} as={Fragment}>
      <Dialog as="div" className="relative z-[10000]" onClose={handleClose}>
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
              className={cn('h-full w-full', isZoomed ? 'overflow-auto' : 'overflow-hidden')}
            >
              {/* A tap beside the image closes; the image itself zooms. */}
              <div
                onClick={handleClose}
                className={cn(
                  'flex cursor-zoom-out items-center justify-center p-4 sm:p-10',
                  isZoomed ? 'min-h-full min-w-full w-max' : 'h-full w-full'
                )}
              >
                {image && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image.src}
                    alt={image.alt}
                    onClick={toggleZoom}
                    style={isZoomed ? { width: zoomedWidth } : undefined}
                    className={cn(
                      'rounded-sm',
                      isZoomed
                        ? 'h-auto max-w-none shrink-0 cursor-zoom-out'
                        : 'max-h-full max-w-full cursor-zoom-in object-contain'
                    )}
                  />
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
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
