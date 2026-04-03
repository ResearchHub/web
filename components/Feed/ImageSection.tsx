'use client';

import { FC, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Search, X } from 'lucide-react';
import { cn } from '@/utils/styles';

export interface ImageSectionProps {
  imageUrl?: string;
  fullSizeImageUrl?: string;
  alt?: string;
  className?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1';
  showFullImage?: boolean;
  expandToFit?: boolean;
  naturalDimensions?: boolean;
  previewOnClick?: boolean;
}

const stopEvent = (e: React.SyntheticEvent) => {
  e.stopPropagation();
  e.preventDefault();
};

const ImagePreviewModal: FC<{
  imageUrl: string;
  alt: string;
  onClose: () => void;
}> = ({ imageUrl, alt, onClose }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setMounted(true));
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, []);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  return createPortal(
    <div
      className={cn(
        'fixed inset-0 z-[10000] flex items-center justify-center transition-colors duration-200',
        mounted ? 'bg-black/60' : 'bg-black/0'
      )}
      onClick={(e) => {
        stopEvent(e);
        onClose();
      }}
      onMouseDown={stopEvent}
    >
      <button
        onClick={(e) => {
          stopEvent(e);
          onClose();
        }}
        onMouseDown={stopEvent}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/90 p-2 shadow-lg hover:bg-white transition-colors"
      >
        <X size={20} className="text-gray-700" />
      </button>
      <div
        className={cn(
          'relative max-w-[90vw] max-h-[90vh] transition-all duration-200',
          mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        )}
        onClick={stopEvent}
        onMouseDown={stopEvent}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={imageUrl}
          alt={alt}
          className="max-w-[90vw] max-h-[90vh] object-contain rounded-lg shadow-2xl"
        />
      </div>
    </div>,
    document.body
  );
};

/**
 * ImageSection - A versatile image component with multiple display modes
 *
 * Display modes:
 * - expandToFit: Fill container and crop to fit (no whitespace)
 * - naturalDimensions: Use natural aspect ratio with max-height constraint
 * - default: Use specified aspectRatio with object-cover/contain
 *
 * Features:
 * - PDF preview detection (adds border when URL contains "preview")
 * - Responsive shadow and rounded corners
 * - previewOnClick: magnifying glass overlay on hover, full-size popover on click
 */
export const ImageSection: FC<ImageSectionProps> = ({
  imageUrl,
  fullSizeImageUrl,
  alt = 'Image',
  className,
  aspectRatio = '4/3',
  showFullImage = false,
  expandToFit = false,
  naturalDimensions = false,
  previewOnClick = false,
}) => {
  const [showPreview, setShowPreview] = useState(false);

  const modalImageUrl = fullSizeImageUrl || imageUrl;
  const canPreview = previewOnClick && !!modalImageUrl;

  const handlePreviewClick = useCallback(
    (e: React.MouseEvent) => {
      if (!canPreview) return;
      e.preventDefault();
      e.stopPropagation();
      setShowPreview(true);
    },
    [canPreview]
  );

  const closePreview = useCallback(() => setShowPreview(false), []);

  if (!imageUrl) return null;

  const isPdfPreview = imageUrl.includes('preview');

  const aspectClasses = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '1/1': 'aspect-square',
  };

  const magnifyOverlay = canPreview && (
    <div
      className="hidden md:!flex absolute inset-0 z-10 items-center justify-center opacity-0 group-hover/imgsec:bg-black/20 group-hover/imgsec:opacity-100 transition-all duration-200 cursor-zoom-in"
      onClick={handlePreviewClick}
      onMouseDown={stopEvent}
    >
      <div className="rounded-full bg-white/80 p-1.5 shadow-sm">
        <Search size={16} className="text-gray-600" />
      </div>
    </div>
  );

  const previewModal =
    showPreview && modalImageUrl ? (
      <ImagePreviewModal imageUrl={modalImageUrl} alt={alt} onClose={closePreview} />
    ) : null;

  if (expandToFit) {
    return (
      <>
        <div
          className={cn(
            'group/imgsec relative overflow-hidden w-full h-[200px] md:rounded-lg md:shadow-sm transition-all duration-300 md:hover:shadow-md',
            isPdfPreview && 'border-[3px] border-gray-200 rounded-lg',
            className
          )}
        >
          {magnifyOverlay}
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        {previewModal}
      </>
    );
  }

  if (naturalDimensions) {
    return (
      <>
        <div
          className={cn(
            'group/imgsec relative overflow-hidden w-full h-full min-h-[120px]',
            isPdfPreview && 'border-[3px] border-gray-100',
            className
          )}
        >
          {magnifyOverlay}
          <Image src={imageUrl} alt={alt} fill sizes="280px" className="object-cover" />
        </div>
        {previewModal}
      </>
    );
  }

  return (
    <>
      <div
        className={cn(
          'group/imgsec relative rounded-lg overflow-hidden shadow-none md:shadow-sm transition-all duration-300 md:hover:shadow-md',
          aspectClasses[aspectRatio],
          isPdfPreview && 'border-[3px] border-gray-100',
          className
        )}
      >
        {magnifyOverlay}
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className={showFullImage ? 'object-contain' : 'object-cover'}
          sizes="(max-width: 768px) 100vw, 280px"
        />
      </div>
      {previewModal}
    </>
  );
};
