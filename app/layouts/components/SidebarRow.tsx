'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

interface SidebarRowProps {
  readonly title: string;
  /** Something before the title: a document's icon. */
  readonly leading?: ReactNode;
  /** Something after the title: the assistant's activity dot. */
  readonly trailing?: ReactNode;
  readonly isActive: boolean;
  readonly onSelect: () => void;
}

/**
 * One entry in a list in the left sidebar: a document, say. A title too long
 * for the row is cut short, and the whole of it shows beside the row on
 * hover.
 */
export function SidebarRow({ title, leading, trailing, isActive, onSelect }: SidebarRowProps) {
  // Held as state, not a ref: wrapping the row in the tooltip mounts a new
  // title element, and the measuring has to follow it.
  const [titleElement, setTitleElement] = useState<HTMLSpanElement | null>(null);
  const truncated = useIsTruncated(titleElement, title);

  const row = (
    <button
      type="button"
      onClick={onSelect}
      aria-current={isActive ? 'true' : undefined}
      className={cn(
        'mb-0.5 flex w-full items-center gap-2.5 rounded-lg py-2 pr-3 text-left transition-colors',
        leading ? 'pl-2.5' : 'pl-3',
        isActive ? 'bg-gray-100' : 'hover:bg-gray-50'
      )}
    >
      {leading}
      <span
        ref={setTitleElement}
        className="min-w-0 flex-1 truncate text-[13px] font-medium text-gray-800"
      >
        {title}
      </span>
      {trailing}
    </button>
  );

  if (!truncated) return row;
  return (
    <Tooltip
      content={title}
      position="right"
      width="w-max max-w-[280px]"
      delay={300}
      hideDelay={0}
      // A tap opens the document; there is no hover to show it on.
      disableTouchClick
      wrapperClassName="flex h-auto w-full"
      className="px-2.5 py-1.5 text-left text-xs leading-snug"
    >
      {row}
    </Tooltip>
  );
}

/** Whether the element's text is cut short, kept up to date as the sidebar resizes. */
function useIsTruncated(element: HTMLElement | null, text: string): boolean {
  const [truncated, setTruncated] = useState(false);
  useEffect(() => {
    if (!element) return undefined;
    const measure = () => setTruncated(element.scrollWidth > element.clientWidth);
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, text]);
  return truncated;
}
