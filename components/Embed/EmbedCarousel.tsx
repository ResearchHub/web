'use client';

import { FC, useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';
import type { DetectedUrl } from '@/utils/url';
import { Embed } from './Embed';
import type { EmbedSize } from './types';

interface EmbedCarouselProps {
  embeds: DetectedUrl[];
  /** Optional caption / context above the divider. */
  className?: string;
  /** When true, omits the top divider — caller has its own separator. */
  hideDivider?: boolean;
  /** Size variant forwarded to each `<Embed>`. Defaults to `md`. */
  size?: EmbedSize;
}

// Slot widths roughly mirror the embed card's max width so a single-card row
// looks like the card itself rather than a tiny chip floating in a wide rail.
const SLOT_WIDTH: Record<EmbedSize, string> = {
  sm: 'w-[min(100%,21rem)]',
  md: 'w-[min(100%,28rem)]',
  lg: 'w-[min(100%,36rem)]',
};

/**
 * Renders a horizontal strip of `<Embed>` cards beneath comment content.
 * Always renders as a "carousel" for consistency, but the scroll arrows only
 * appear when the row actually overflows — per product spec a single-card row
 * should look like a single card with no chrome around it.
 *
 * A horizontal divider above the strip signals that this is a footer for
 * the surrounding content (the embeds are derived from the comment, not
 * authored separately).
 */
export const EmbedCarousel: FC<EmbedCarouselProps> = ({
  embeds,
  className,
  hideDivider,
  size = 'md',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    const isScrollable = el.scrollWidth > el.clientWidth + 1;
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    setCanScrollRight(!nearEnd && isScrollable);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll, embeds.length]);

  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const amount = el.clientWidth * 0.8;
    el.scrollBy({ left: direction === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  if (embeds.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      {!hideDivider && <div className="my-3 border-t border-gray-200" />}
      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scroll('left')}
            aria-label="Scroll embeds left"
            className="absolute left-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:bg-gray-50 active:scale-95"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}

        <div ref={scrollRef} className="flex gap-3 overflow-x-auto scroll-smooth scrollbar-hide">
          {embeds.map((embed) => (
            <div key={embed.url} className={cn(SLOT_WIDTH[size], 'shrink-0')}>
              <Embed embed={embed} size={size} />
            </div>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scroll('right')}
            aria-label="Scroll embeds right"
            className="absolute right-1 top-1/2 z-10 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-700 shadow-md transition hover:bg-gray-50 active:scale-95"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        )}
      </div>
    </div>
  );
};
