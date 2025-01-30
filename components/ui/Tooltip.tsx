'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/utils/styles';

interface TooltipProps {
  children: React.ReactNode;
  content: React.ReactNode;
  className?: string;
}

const TooltipContent = ({
  content,
  triggerRect,
  className,
}: {
  content: React.ReactNode;
  triggerRect: DOMRect | null;
  className?: string;
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!tooltipRef.current || !triggerRect) return;

    const tooltip = tooltipRef.current;
    const tooltipRect = tooltip.getBoundingClientRect();

    // Center horizontally and position below the trigger
    const left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
    const top = triggerRect.bottom + 8; // 8px gap below the trigger

    tooltip.style.left = `${left}px`;
    tooltip.style.top = `${top}px`;
  }, [triggerRect]);

  if (!triggerRect) return null;

  return createPortal(
    <div
      ref={tooltipRef}
      className={cn(
        'fixed z-50 px-2 py-1 text-sm text-gray-700 bg-white border border-gray-100 rounded shadow-sm transition-opacity duration-150',
        className
      )}
    >
      {content}
    </div>,
    document.body
  );
};

export function Tooltip({ children, content, className }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    if (triggerRef.current) {
      setTriggerRect(triggerRef.current.getBoundingClientRect());
      setIsVisible(true);
    }
  };

  const hideTooltip = () => {
    setIsVisible(false);
    setTriggerRect(null);
  };

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className="inline-block"
      >
        {children}
      </div>
      {isVisible && (
        <TooltipContent content={content} triggerRect={triggerRect} className={className} />
      )}
    </>
  );
}
