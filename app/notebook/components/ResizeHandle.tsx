'use client';

import { useState, useEffect } from 'react';

interface ResizeHandleProps {
  onResize: (width: number) => void;
  minWidth?: number;
  maxWidth?: number;
  side?: 'left' | 'right';
}

export function ResizeHandle({
  onResize,
  minWidth = 280,
  maxWidth = 600,
  side = 'right',
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    e.preventDefault();
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      let newWidth;
      if (side === 'right') {
        // For left sidebar: measure from left edge
        newWidth = e.clientX - 70; // Subtract the 70px main sidebar width
      } else {
        // For right sidebar: measure from right edge
        newWidth = window.innerWidth - e.clientX;
      }
      const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      onResize(clampedWidth);
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, onResize, minWidth, maxWidth, side]);

  return (
    <div
      onMouseDown={handleMouseDown}
      className={`absolute ${side === 'right' ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 cursor-col-resize hover:bg-blue-500 transition-colors z-50 ${
        isDragging ? 'bg-blue-500' : 'bg-transparent'
      }`}
      style={{
        marginRight: side === 'right' ? '-2px' : undefined,
        marginLeft: side === 'left' ? '-2px' : undefined,
      }}
      role="separator"
      aria-label="Resize sidebar"
      aria-valuenow={undefined}
    />
  );
}
