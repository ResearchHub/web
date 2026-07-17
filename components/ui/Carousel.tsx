'use client';

import { FC, ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface CarouselProps {
  children: ReactNode;
  className?: string;
  onReachEnd?: () => void;
  arrowOffset?: 'inset' | 'outset';
}

const ARROW_POSITION = {
  inset: { left: '-left-4', right: '-right-7' },
  outset: { left: '-left-8', right: '-right-11' },
} as const;

export const Carousel: FC<CarouselProps> = ({
  children,
  className,
  onReachEnd,
  arrowOffset = 'inset',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const onReachEndRef = useRef(onReachEnd);
  onReachEndRef.current = onReachEnd;
  const hasScrolledRef = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    // `px-3 -mx-3` on the scroller means scrollLeft at rest equals paddingLeft, not 0.
    const paddingLeft = parseFloat(getComputedStyle(el).paddingLeft) || 0;
    const atStart = el.scrollLeft <= paddingLeft + 1;
    setCanScrollLeft(!atStart);
    const isScrollable = el.scrollWidth > el.clientWidth + 1;
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 100;
    setCanScrollRight(!nearEnd && isScrollable);
    if (!atStart) hasScrolledRef.current = true;
    if (nearEnd && hasScrolledRef.current && onReachEndRef.current) {
      onReachEndRef.current();
    }
  }, []);

  useEffect(() => {
    checkScroll();
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

  return (
    <div className={cn('group/carousel relative', className)}>
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer',
            arrowPosition.left
          )}
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide py-3 px-3 -mx-3"
      >
        {children}
      </div>

      <button
        onClick={() => scroll('right')}
        disabled={!canScrollRight}
        className={cn(
          'absolute top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 transition-all',
          arrowPosition.right,
          canScrollRight
            ? 'text-gray-900 hover:bg-gray-200 active:scale-95 cursor-pointer'
            : 'text-gray-300 opacity-50 cursor-default'
        )}
        aria-label="Scroll right"
      >
        <ChevronRight className="h-6 w-6" />
      </button>
    </div>
  );
};
