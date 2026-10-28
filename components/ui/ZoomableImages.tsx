'use client';

import { type MouseEvent, type ReactNode, useState } from 'react';
import { ImageLightbox, type LightboxImage } from '@/components/modals/ImageLightbox';
import { cn } from '@/utils/styles';

/**
 * Wraps a work's body: a click on one of its images opens it full screen. An
 * image inside a link still goes where it links.
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

  const handleClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement) || target.closest('a')) return;
    const src = target.currentSrc || target.src;
    if (!src) return;
    setImage({ src, alt: target.alt });
    setIsOpen(true);
  };

  return (
    <>
      <div className={cn('[&_img:not(a_img)]:cursor-zoom-in', className)} onClick={handleClick}>
        {children}
      </div>
      {/* Outside the wrapper: clicks in the lightbox bubble through React's tree,
          and would open it again. */}
      <ImageLightbox isOpen={isOpen} image={image} onClose={() => setIsOpen(false)} />
    </>
  );
}
