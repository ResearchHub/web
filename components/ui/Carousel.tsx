'use client';

import { FC, ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/utils/styles';

interface CarouselProps {
  children: ReactNode;
  className?: string;
  onReachEnd?: () => void;
  arrowOffset?: 'inset' | 'outset';
  /** Leave the arrows out when everything fits, rather than show a disabled one. */
  hideArrowsWhenStatic?: boolean;
  /**
   * Keep the row's left inset. Mandatory snapping otherwise scrolls that
   * padding away after the first paint, and `scroll-smooth` turns the
   * correction into a visible jump.
   */
  keepInset?: boolean;
}

const ARROW_POSITION = {
  inset: { left: '-left-4', right: '-right-7' },
  outset: { left: '-left-8', right: '-right-11' },
} as const;

/** A horizontal row that snaps. Arrows stay once it overflows, and grey out at either end. */
export const Carousel: FC<CarouselProps> = ({
  children,
  className,
  onReachEnd,
  arrowOffset = 'inset',
  hideArrowsWhenStatic = false,
  keepInset = false,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const onReachEndRef = useRef(onReachEnd);
  onReachEndRef.current = onReachEnd;
  const hasScrolledRef = useRef(false);
  const hasRequestedMoreRef = useRef(false);

  /** Whether the row can still move, and whether the end should load another page. */
  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // `px-3 -mx-3` on the scroller means scrollLeft at rest equals paddingLeft, not 0.
    const paddingLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const atStart = el.scrollLeft <= paddingLeft + 1;
    setCanScrollLeft(!atStart);
    const isScrollable = el.scrollWidth > el.clientWidth + 1;
    const atEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 1;
    const shouldLoadMore = el.scrollLeft + el.clientWidth >= el.scrollWidth - el.clientWidth;
    setCanScrollRight(!atEnd && isScrollable);
    if (!atStart) hasScrolledRef.current = true;
    if (!shouldLoadMore) hasRequestedMoreRef.current = false;
    if (
      shouldLoadMore &&
      !hasRequestedMoreRef.current &&
      hasScrolledRef.current &&
      onReachEndRef.current
    ) {
      hasRequestedMoreRef.current = true;
      onReachEndRef.current();
    }
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener('scroll', checkScroll, { passive: true });
    const observer = new ResizeObserver(checkScroll);
    observer.observe(el);

    return () => {
      el.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [checkScroll]);

  useEffect(() => {
    // Appending a paginated page changes scrollWidth without resizing the container.
    checkScroll();
  }, [checkScroll, children]);

  /** Move about one view left or right. */
  const scroll = (direction: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  const arrowPosition = ARROW_POSITION[arrowOffset];
  // Once the row overflows, both arrows stay up. A direction with nowhere
  // left to go is greyed, the same at either end.
  const overflows = canScrollLeft || canScrollRight;
  const showRightArrow = overflows || !hideArrowsWhenStatic;

  return (
    <div className={cn('group/carousel relative', className)}>
      {overflows && (
        <Button
          type="button"
          variant="outlined"
          size="icon"
          onClick={() => scroll('left')}
          disabled={!canScrollLeft}
          aria-label="Scroll left"
          className={cn(
            'absolute top-1/2 z-10 -translate-y-1/2 rounded-full shadow-md',
            arrowPosition.left,
            !canScrollLeft && 'text-gray-300'
          )}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
      )}

      <div
        ref={scrollRef}
        className={cn(
          'flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory',
          'scrollbar-hide py-3 px-3 -mx-3',
          // Inset the snapport by the same padding, so the first card is already
          // snapped at scrollLeft 0 and the browser does not scroll the padding off.
          keepInset && 'scroll-px-3'
        )}
      >
        {children}
      </div>

      {showRightArrow && (
        <Button
          type="button"
          variant="outlined"
          size="icon"
          onClick={() => scroll('right')}
          disabled={!canScrollRight}
          aria-label="Scroll right"
          className={cn(
            'absolute top-1/2 z-10 -translate-y-1/2 rounded-full shadow-lg',
            arrowPosition.right,
            canScrollRight ? 'text-gray-900' : 'text-gray-300'
          )}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
};
