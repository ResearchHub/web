'use client';

import { X as CloseIcon } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface SwipeableDrawerProps {
  /**
   * Controls whether the drawer is open or closed
   */
  isOpen: boolean;

  /**
   * Function to call when the drawer should close
   */
  onClose: () => void;

  /**
   * Height of the drawer
   * @default '50vh'
   */
  height?: string;

  /**
   * Content to display inside the drawer
   */
  children: React.ReactNode;

  /**
   * Whether to show the close button in the top-right corner
   * @default true
   */
  showCloseButton?: boolean;

  /**
   * Additional class names to apply to the drawer
   */
  className?: string;

  /**
   * Threshold for swipe distance to close the drawer
   * @default 50
   */
  swipeThreshold?: number;
}

/**
 * A swipeable drawer component that slides up from the bottom of the screen.
 * Designed for mobile views with touch interactions - users can swipe down to dismiss.
 */
export const SwipeableDrawer: React.FC<SwipeableDrawerProps> = ({
  isOpen,
  onClose,
  height = '50vh',
  children,
  showCloseButton = true,
  className = '',
  swipeThreshold = 50,
}) => {
  const [isMounted, setIsMounted] = useState(false);
  const drawerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Mount only on client-side
  useEffect(() => {
    setIsMounted(true);

    // Lock body scroll when drawer is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent): void => {
    setTouchStart(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent): void => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const handleTouchEnd = (): void => {
    if (!touchStart || !touchEnd) return;

    const distance = touchEnd - touchStart;
    const isSwipeDown = distance > swipeThreshold;

    if (isSwipeDown) {
      onClose();
    }

    // Reset values
    setTouchStart(null);
    setTouchEnd(null);
  };

  // Close the drawer when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (drawerRef.current && !drawerRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  // If not mounted (client side), don't render anything
  if (!isMounted) return null;

  // Define drawer content
  const drawerContent = (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 z-[1000] transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed bottom-0 left-0 right-0 z-[1001] bg-white shadow-xl rounded-t-lg transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        } ${className}`}
        style={{ height }}
        onClick={(e) => e.stopPropagation()}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        role="dialog"
        aria-modal="true"
      >
        {/* Drawer handle for better UX */}
        <div className="w-full flex justify-center pt-2 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full"></div>
        </div>

        {showCloseButton && (
          <button
            onClick={onClose}
            className="absolute top-[18px] right-3 p-1.5 rounded-full hover:bg-gray-100"
            aria-label="Close drawer"
            type="button"
          >
            <CloseIcon className="h-6 w-6 text-gray-500" />
          </button>
        )}
        <div
          className="drawer-content p-4 pt-2 overflow-y-auto flex flex-col"
          style={{ height: `calc(${height} - 40px)` }}
        >
          {children}
        </div>
      </div>
    </>
  );

  // Use createPortal to mount drawer to body
  return createPortal(drawerContent, document.body);
};

export default SwipeableDrawer;
