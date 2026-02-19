'use client';

import { FC, ReactNode, useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface CarouselProps {
  children: ReactNode;
  className?: string;
}

export const Carousel: FC<CarouselProps> = ({ children, className }) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
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
      {/* Left edge overlay */}
      {canScrollLeft && (
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-10 w-10 flex items-center justify-start pl-1 bg-gradient-to-r from-white/90 via-white/60 to-transparent text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-6 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide py-3 px-3 -mx-3"
      >
        {children}
      </div>

      {/* Right edge overlay */}
      {canScrollRight && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-10 w-10 flex items-center justify-end pr-1 bg-gradient-to-l from-white/90 via-white/60 to-transparent text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};
