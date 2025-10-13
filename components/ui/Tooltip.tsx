'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/styles';
import { useIsMobile } from '@/hooks/useIsMobile';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  delay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string; // Width class for the tooltip (e.g., 'w-38', 'w-80', 'w-96')
}

const TooltipContent = ({
  content,
  triggerRect,
  className,
  isVisible,
  position = 'bottom',
  width = 'w-38',
  onMouseEnter,
  onMouseLeave,
}: {
  content: React.ReactNode;
  triggerRect: DOMRect | null;
  className?: string;
  isVisible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [mounted, setMounted] = useState(false);

  // Position the tooltip based on the trigger element
  useEffect(() => {
    if (!tooltipRef.current || !triggerRect) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let top = 0;
    let left = 0;

    // Calculate position based on specified position
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + 8;
        break;
    }

    // Adjust if tooltip would go off screen
    if (left < 10) left = 10;
    if (left + tooltipRect.width > windowWidth - 10) left = windowWidth - tooltipRect.width - 10;
    if (top < 10) top = 10;
    if (top + tooltipRect.height > windowHeight - 10) top = windowHeight - tooltipRect.height - 10;

    setTooltipPosition({ top, left });
    setMounted(true);
  }, [triggerRect, position]);

  if (!triggerRect) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 px-4 py-3 text-sm text-gray-800 bg-white rounded-md shadow-md border border-gray-200 text-center',
        width,
        'transition-opacity duration-150 break-words',
        {
          'opacity-100': mounted,
          'opacity-0': !mounted,
        },
        className
      )}
      style={{
        top: `${tooltipPosition.top}px`,
        left: `${tooltipPosition.left}px`,
      }}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {content}
    </div>,
    document.body
  );
};

export function Tooltip({
  children,
  content,
  className,
  wrapperClassName,
  delay = 100,
  position = 'bottom',
  width = 'w-38',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMobile = useIsMobile();

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, []);

  // TODO: This is more efficient than rendering the tooltips on mobile,
  //  but it's still not ideal because we still have to call all the hooks
  //  to satisfy React's rules. The alternative would be to handle tooltip
  //  vs. no-tooltip on each component, but that's a large scope and needs to
  //  be maintained. This will do for now, until the alternative is necessary.
  if (isMobile) return <>{children}</>; // If on mobile, tooltips are irrelevant.

  const showTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    hideTimeoutRef.current = setTimeout(() => {
      if (!isHoveringTooltip) {
        setIsVisible(false);
      }
    }, 200);
  };

  const handleTooltipMouseEnter = () => {
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }
    setIsHoveringTooltip(true);
  };

  const handleTooltipMouseLeave = () => {
    setIsHoveringTooltip(false);
    setIsVisible(false);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        onFocus={showTooltip}
        onBlur={hideTooltip}
        className={cn('inline-flex h-full', wrapperClassName)}
      >
        {children}
      </div>
      {triggerRect && isVisible && (
        <TooltipContent
          content={content}
          triggerRect={triggerRect}
          className={className}
          isVisible={isVisible}
          position={position}
          width={width}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        />
      )}
    </>
  );
}
