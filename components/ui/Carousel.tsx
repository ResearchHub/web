'use client';

import { FC, ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface CarouselProps {
  children: ReactNode;
  className?: string;
  onReachEnd?: () => void;
}

export const Carousel: FC<CarouselProps> = ({ children, className, onReachEnd }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const onReachEndRef = useRef(onReachEnd);
  onReachEndRef.current = onReachEnd;
  const hasScrolledRef = useRef(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    const isScrollable = el.scrollWidth > el.clientWidth + 1;
    const nearEnd = el.scrollLeft + el.clientWidth >= el.scrollWidth - 100;
    setCanScrollRight(!nearEnd && isScrollable);
    if (el.scrollLeft > 0) hasScrolledRef.current = true;
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

  return (
    <div className={cn('group/carousel relative', className)}>
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-md border border-gray-200 text-gray-800 hover:bg-gray-50 active:scale-95 transition-all cursor-pointer"
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
          'absolute -right-7 top-1/2 -translate-y-1/2 z-10 h-10 w-10 flex items-center justify-center rounded-full bg-white shadow-lg border border-gray-200 transition-all',
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
