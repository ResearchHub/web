'use client';

import { FC } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/styles';

export interface ImageSectionProps {
  imageUrl?: string;
  alt?: string;
  className?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1';
  showFullImage?: boolean;
  expandToFit?: boolean;
  naturalDimensions?: boolean; // Let image use natural aspect ratio with max-height
}

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
 */
export const ImageSection: FC<ImageSectionProps> = ({
  imageUrl,
  alt = 'Image',
  className,
  aspectRatio = '4/3',
  showFullImage = false,
  expandToFit = false,
  naturalDimensions = false,
}) => {
  if (!imageUrl) return null;

  // Detect if this is a PDF preview (URL contains "preview")
  const isPdfPreview = imageUrl.includes('preview');

  const aspectClasses = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '1/1': 'aspect-square',
  };

  // When expandToFit is true, fill the container and crop to fit (no whitespace)
  if (expandToFit) {
    return (
      <div
        className={cn(
          'relative overflow-hidden w-full h-[200px] md:rounded-lg md:shadow-sm transition-all duration-300 md:hover:shadow-md',
          isPdfPreview && 'border-[3px] border-gray-200 rounded-lg',
          className
        )}
      >
        <Image src={imageUrl} alt={alt} fill className="object-cover object-center" sizes="100vw" />
      </div>
    );
  }

  // When naturalDimensions is true, let image use its natural aspect ratio with max-height
  if (naturalDimensions) {
    return (
      <div
        className={cn(
          'relative rounded-lg overflow-hidden shadow-none md:shadow-sm transition-all duration-300 md:hover:shadow-md w-full',
          isPdfPreview && 'border-[3px] border-gray-100',
          className
        )}
      >
        <Image
          src={imageUrl}
          alt={alt}
          width={0}
          height={0}
          sizes="100vw"
          className="w-full h-auto max-h-[240px] object-contain"
          style={{ width: '100%', height: 'auto' }}
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        'relative rounded-lg overflow-hidden shadow-none md:shadow-sm transition-all duration-300 md:hover:shadow-md',
        aspectClasses[aspectRatio],
        isPdfPreview && 'border-[3px] border-gray-100',
        className
      )}
    >
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className={showFullImage ? 'object-contain' : 'object-cover'}
        sizes="(max-width: 768px) 100vw, 280px"
      />
    </div>
  );
};
