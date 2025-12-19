'use client';

import { FC, useState, useRef } from 'react';
import Image from 'next/image';
import { cn } from '@/utils/styles';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { MagnifierTooltip } from '@/components/ui/MagnifierTooltip';

export interface ImageSectionProps {
  imageUrl?: string;
  fullImageUrl?: string; // Full resolution image for zoom popup
  alt?: string;
  className?: string;
  aspectRatio?: '4/3' | '16/9' | '1/1';
  showFullImage?: boolean;
  expandToFit?: boolean;
  enableZoom?: boolean; // Enable hover zoom popup
  naturalDimensions?: boolean; // Let image use natural aspect ratio with max-height
}

/**
 * ImageSection - A versatile image component with multiple display modes and optional magnifier
 *
 * Display modes:
 * - expandToFit: Fill container and crop to fit (no whitespace)
 * - naturalDimensions: Use natural aspect ratio with max-height constraint
 * - default: Use specified aspectRatio with object-cover/contain
 *
 * Features:
 * - Magnifier tooltip on hover (desktop only)
 * - PDF preview detection (adds border when URL contains "preview")
 * - Responsive shadow and rounded corners
 */
export const ImageSection: FC<ImageSectionProps> = ({
  imageUrl,
  fullImageUrl,
  alt = 'Image',
  className,
  aspectRatio = '4/3',
  showFullImage = false,
  expandToFit = false,
  enableZoom = false,
  naturalDimensions = false,
}) => {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [containerRect, setContainerRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isTouchDevice = useIsTouchDevice();

  // Disable zoom on touch devices
  const isZoomEnabled = enableZoom && !isTouchDevice;

  if (!imageUrl) return null;

  // Detect if this is a PDF preview (URL contains "preview")
  const isPdfPreview = imageUrl.includes('preview');

  const aspectClasses = {
    '4/3': 'aspect-[4/3]',
    '16/9': 'aspect-[16/9]',
    '1/1': 'aspect-square',
  };

  // The image URL to show in the zoom (prefer fullImageUrl, fallback to imageUrl)
  const zoomImageUrl = fullImageUrl || imageUrl;

  // Magnifier settings
  const magnifierWidth = 800;
  const magnifierHeight = 700;
  const zoomLevel = 1.25;

  const handleMouseEnter = () => {
    if (isZoomEnabled && containerRef.current) {
      setContainerRect(containerRef.current.getBoundingClientRect());
      setIsHovering(true);
    }
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isZoomEnabled || !containerRect) return;

    // Calculate mouse position relative to the container (0-1 range)
    const x = (e.clientX - containerRect.left) / containerRect.width;
    const y = (e.clientY - containerRect.top) / containerRect.height;

    setMousePos({ x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) });
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isZoomEnabled) {
      e.stopPropagation();
      e.preventDefault();
    }
  };

  // When expandToFit is true, fill the container and crop to fit (no whitespace)
  if (expandToFit) {
    return (
      <>
        <div
          ref={containerRef}
          className={cn(
            'relative overflow-hidden w-full h-[200px] md:rounded-lg md:shadow-sm transition-all duration-300 md:hover:shadow-md',
            isPdfPreview && 'border-[3px] border-gray-200 rounded-lg',
            isZoomEnabled && 'cursor-crosshair',
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
        >
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-cover object-center"
            sizes="100vw"
          />
        </div>
        <MagnifierTooltip
          isVisible={isHovering && isZoomEnabled}
          imageUrl={zoomImageUrl}
          mousePos={mousePos}
          containerRect={containerRect}
          width={magnifierWidth}
          height={magnifierHeight}
          zoomLevel={zoomLevel}
        />
      </>
    );
  }

  // When naturalDimensions is true, let image use its natural aspect ratio with max-height
  if (naturalDimensions) {
    return (
      <>
        <div
          ref={containerRef}
          className={cn(
            'relative rounded-lg overflow-hidden shadow-none md:shadow-sm transition-all duration-300 md:hover:shadow-md w-full',
            isPdfPreview && 'border-[3px] border-gray-100',
            isZoomEnabled && 'cursor-crosshair',
            className
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onMouseMove={handleMouseMove}
          onClick={handleClick}
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
        <MagnifierTooltip
          isVisible={isHovering && isZoomEnabled}
          imageUrl={zoomImageUrl}
          mousePos={mousePos}
          containerRect={containerRect}
          width={magnifierWidth}
          height={magnifierHeight}
          zoomLevel={zoomLevel}
        />
      </>
    );
  }

  return (
    <>
      <div
        ref={containerRef}
        className={cn(
          'relative rounded-lg overflow-hidden shadow-none md:shadow-sm transition-all duration-300 md:hover:shadow-md',
          aspectClasses[aspectRatio],
          isPdfPreview && 'border-[3px] border-gray-100',
          isZoomEnabled && 'cursor-crosshair',
          className
        )}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleMouseMove}
        onClick={handleClick}
      >
        <Image
          src={imageUrl}
          alt={alt}
          fill
          className={showFullImage ? 'object-contain' : 'object-cover'}
          sizes="(max-width: 768px) 100vw, 280px"
        />
      </div>
      <MagnifierTooltip
        isVisible={isHovering && isZoomEnabled}
        imageUrl={zoomImageUrl}
        mousePos={mousePos}
        containerRect={containerRect}
        width={magnifierWidth}
        height={magnifierHeight}
        zoomLevel={zoomLevel}
      />
    </>
  );
};
