'use client';

import { type MouseEvent, type ReactNode, useState } from 'react';
import { ImageLightbox, type LightboxImage } from '@/components/modals/ImageLightbox';
import { cn } from '@/utils/styles';

/** The image a click on the body opens: any but one inside a link. */
function getZoomableImage(target: EventTarget): HTMLImageElement | null {
  return target instanceof HTMLImageElement && !target.closest('a') ? target : null;
}

/**
 * Wraps a work's body: a click on one of its images opens it full screen. An
 * image inside a link still goes where it links.
 *
 * A press on an image is never a drag: images drag by default, so a click
 * that moved a few pixels pulled a ghost of the image along, swapped the zoom
 * cursor for the drag one and never opened it. The editor leaves a figure's
 * images unclickable; here they open like the others.
 */
export function ZoomableImages({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [image, setImage] = useState<LightboxImage | null>(null);

  const handleMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    // Cancelling the press stops the drag, and a text selection from it.
    if (event.button === 0 && getZoomableImage(event.target)) event.preventDefault();
  };

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = getZoomableImage(event.target);
    const src = target && (target.currentSrc || target.src);
    if (!target || !src) return;
    setImage({ src, alt: target.alt });
    setIsOpen(true);
  };

  return (
    <>
      <div
        className={cn(
          '[&_figure_img:not(a_img)]:pointer-events-auto [&_img:not(a_img)]:cursor-zoom-in',
          className
        )}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        {children}
      </div>
      {/* Outside the wrapper: clicks in the lightbox bubble through React's tree,
          and would open it again. */}
      <ImageLightbox isOpen={isOpen} image={image} onClose={() => setIsOpen(false)} />
    </>
  );
}
