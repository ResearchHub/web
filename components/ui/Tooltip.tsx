'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/utils/styles';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { useOutsidePointerDown } from '@/hooks/useOutsidePointerDown';

const tooltipContentVariants = cva(
  'fixed z-[10000] px-4 py-3 text-sm rounded-md shadow-md border transition-opacity duration-150 break-words',
  {
    variants: {
      theme: {
        light: 'text-gray-800 bg-white border-gray-200 text-center',
        dark: 'text-white bg-gray-900 border-gray-900 text-left',
      },
    },
    defaultVariants: {
      theme: 'light',
    },
  }
);

interface TooltipProps extends VariantProps<typeof tooltipContentVariants> {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
  wrapperClassName?: string;
  delay?: number;
  hideDelay?: number;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string; // Width class for the tooltip (e.g., 'w-38', 'w-80', 'w-96')
  /** When true, disable the tap-to-open behavior on touch devices (tooltip won't show at all there). */
  disableTouchClick?: boolean;
  /** Draw a small pointer from the tooltip to its trigger. */
  arrow?: boolean;
  /**
   * When true, the tooltip closes as soon as the user clicks anywhere inside
   * its content. Useful for popover-style tooltips whose content contains
   * primary actions (e.g. an embed card that opens a modal on click) — the
   * tooltip should yield to the action surface rather than linger on top of it.
   */
  closeOnContentClick?: boolean;
  /**
   * HTML element to use for the trigger wrapper. Defaults to `'div'` (block-
   * compatible default for layout contexts). Set to `'span'` when the tooltip
   * is rendered inside inline-only HTML (e.g. inside a `<p>` paragraph) so
   * the resulting DOM is valid — `<div>` cannot legally descend from `<p>`
   * regardless of CSS display, which triggers React's hydration warning.
   */
  wrapperAs?: 'div' | 'span';
}

const TooltipContent = ({
  content,
  triggerRect,
  className,
  isVisible,
  position = 'bottom',
  width = 'w-38',
  theme = 'light',
  arrow = false,
  onMouseEnter,
  onMouseLeave,
  onContentClick,
}: {
  content: React.ReactNode;
  triggerRect: DOMRect | null;
  className?: string;
  isVisible: boolean;
  position?: 'top' | 'bottom' | 'left' | 'right';
  width?: string;
  theme?: VariantProps<typeof tooltipContentVariants>['theme'];
  arrow?: boolean;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContentClick?: () => void;
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  // Where the arrow sits along the tooltip's edge, in px from its top/left.
  const [arrowOffset, setArrowOffset] = useState(0);
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
    // An arrow reaches most of the way across the usual gap; widen it so the
    // tip stops short of the trigger instead of touching it.
    const gap = arrow ? 14 : 8;

    // Calculate position based on specified position
    switch (position) {
      case 'top':
        top = triggerRect.top - tooltipRect.height - gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + gap;
        left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.left - tooltipRect.width - gap;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
        left = triggerRect.right + gap;
        break;
    }

    // Adjust if tooltip would go off screen
    if (left < 10) left = 10;
    if (left + tooltipRect.width > windowWidth - 10) left = windowWidth - tooltipRect.width - 10;
    if (top < 10) top = 10;
    if (top + tooltipRect.height > windowHeight - 10) top = windowHeight - tooltipRect.height - 10;

    // The tooltip may have been nudged to stay on screen, so the arrow aims at
    // the trigger's centre rather than the tooltip's — kept off the corners.
    const isVertical = position === 'top' || position === 'bottom';
    const target = isVertical
      ? triggerRect.left + triggerRect.width / 2 - left
      : triggerRect.top + triggerRect.height / 2 - top;
    const edgeLength = isVertical ? tooltipRect.width : tooltipRect.height;
    setArrowOffset(Math.min(Math.max(target, 12), edgeLength - 12));

    setTooltipPosition({ top, left });
    setMounted(true);
  }, [triggerRect, position, arrow]);

  if (!triggerRect) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={cn(
        tooltipContentVariants({ theme }),
        width,
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
      // Use bubble-phase `onClick` (not `mousedown`-capture) so the click
      // event still gets a chance to reach the actual interactive element
      // inside the tooltip first. Tearing the portal down on mousedown
      // unmounts the click target before `mouseup`, so the browser never
      // dispatches a `click` and the user's intended action is dropped.
      // React batches the resulting two state updates (action + tooltip
      // close) into the same render, so visually they happen together.
      onClick={onContentClick}
    >
      {content}
      {arrow && (
        // A rotated square that inherits the tooltip's fill and border, showing
        // only the two edges that face the trigger.
        <span
          aria-hidden="true"
          className={cn('absolute h-2.5 w-2.5 rotate-45 border-inherit bg-inherit', {
            '-bottom-[6px] -ml-[5px] border-b border-r': position === 'top',
            '-top-[6px] -ml-[5px] border-l border-t': position === 'bottom',
            '-right-[6px] -mt-[5px] border-r border-t': position === 'left',
            '-left-[6px] -mt-[5px] border-b border-l': position === 'right',
          })}
          style={
            position === 'top' || position === 'bottom'
              ? { left: `${arrowOffset}px` }
              : { top: `${arrowOffset}px` }
          }
        />
      )}
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
  hideDelay = 200,
  position = 'bottom',
  width = 'w-38',
  theme = 'light',
  disableTouchClick = false,
  arrow = false,
  closeOnContentClick = false,
  wrapperAs = 'div',
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isHoveringTooltip, setIsHoveringTooltip] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  // Trigger ref is on the wrapper element; it can be HTMLDivElement or
  // HTMLSpanElement depending on `wrapperAs`. Both extend HTMLElement so we
  // type the ref as such — the only API we use on it is
  // `getBoundingClientRect`, which lives on HTMLElement.
  const triggerRef = useRef<HTMLElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isTouchDevice = useIsTouchDevice();

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
    }, hideDelay);
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

  useOutsidePointerDown(triggerRef, () => setIsVisible(false), isTouchDevice && isVisible);

  const triggerHandlers = isTouchDevice
    ? disableTouchClick
      ? {}
      : { onClick: () => (isVisible ? setIsVisible(false) : showTooltip()) }
    : {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      };

  // The trigger wrapper element is `wrapperAs` (defaults to `<div>`). When
  // the tooltip is hosted inside inline-only HTML (e.g. a TipTap `<p>`
  // paragraph for InlineRichLink), callers should pass `wrapperAs="span"`
  // so the resulting DOM is valid — see TooltipProps.wrapperAs.
  const Wrapper = wrapperAs;
  return (
    <>
      <Wrapper
        ref={triggerRef as React.Ref<HTMLDivElement & HTMLSpanElement>}
        {...triggerHandlers}
        className={cn('inline-flex h-full', wrapperClassName)}
      >
        {children}
      </Wrapper>
      {triggerRect && isVisible && (
        <TooltipContent
          content={content}
          triggerRect={triggerRect}
          className={className}
          isVisible={isVisible}
          position={position}
          width={width}
          theme={theme}
          arrow={arrow}
          onMouseEnter={handleTooltipMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
          onContentClick={
            closeOnContentClick
              ? () => {
                  if (timeoutRef.current) clearTimeout(timeoutRef.current);
                  if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
                  setIsHoveringTooltip(false);
                  setIsVisible(false);
                }
              : undefined
          }
        />
      )}
    </>
  );
}
