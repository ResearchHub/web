'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/styles';
import { useIsTouchDevice } from '@/hooks/useIsTouchDevice';
import { useOutsidePointerDown } from '@/hooks/useOutsidePointerDown';

interface TooltipProps {
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
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContentClick?: () => void;
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
        'fixed z-[10000] px-4 py-3 text-sm text-gray-800 bg-white rounded-md shadow-md border border-gray-200 text-center',
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
  disableTouchClick = false,
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
