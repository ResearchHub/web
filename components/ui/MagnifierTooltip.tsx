'use client';

import { FC } from 'react';

export interface MagnifierTooltipProps {
  /** Whether the tooltip is visible */
  isVisible: boolean;
  /** The image URL to display in the magnifier */
  imageUrl: string;
  /** Mouse position as percentage (0-1 range) */
  mousePos: { x: number; y: number };
  /** The bounding rectangle of the container element */
  containerRect: DOMRect | null;
  /** Width of the magnifier tooltip in pixels */
  width?: number;
  /** Height of the magnifier tooltip in pixels */
  height?: number;
  /** Zoom level multiplier */
  zoomLevel?: number;
}

/**
 * MagnifierTooltip - A tooltip that shows a magnified view of an image
 * Positioned to the left of the container, shows the area where the mouse is hovering
 */
export const MagnifierTooltip: FC<MagnifierTooltipProps> = ({
  isVisible,
  imageUrl,
  mousePos,
  containerRect,
  width = 800,
  height = 700,
  zoomLevel = 1.25,
}) => {
  if (!isVisible || !containerRect) return null;

  // Calculate background position for the magnified area
  const bgPosX = mousePos.x * 100;
  const bgPosY = mousePos.y * 100;

  // Always position the tooltip to the left of the image container
  const finalX = containerRect.left - width - 16;
  // Vertically center the tooltip relative to the image container
  const finalY = containerRect.top + (containerRect.height - height) / 2;

  // Clamp Y position to stay within viewport
  const clampedY = Math.max(10, Math.min(window.innerHeight - height - 10, finalY));

  return (
    <div
      className="fixed z-50 rounded-xl overflow-hidden shadow-2xl border-4 border-white/90 pointer-events-none bg-gray-100"
      style={{
        width,
        height,
        left: Math.max(10, finalX), // Ensure it doesn't go off-screen left
        top: clampedY,
        backgroundImage: `url(${imageUrl})`,
        backgroundPosition: `${bgPosX}% ${bgPosY}%`,
        backgroundSize: `${zoomLevel * 100}%`,
        backgroundRepeat: 'no-repeat',
      }}
    />
  );
};
