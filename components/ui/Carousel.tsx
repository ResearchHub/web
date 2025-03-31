'use client';

import { FC, ReactNode, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface CarouselProps {
  /**
   * The carousel items to display
   */
  children: ReactNode[];

  /**
   * The title of the carousel section
   */
  title: string;

  /**
   * Optional icon to display next to the title
   */
  icon?: ReactNode;

  /**
   * Function to handle "see all" button click
   */
  onSeeAllClick?: () => void;

  /**
   * Text for the "see all" button
   * @default "See All"
   */
  seeAllText?: string;

  /**
   * Number of items to show per slide
   * @default 3
   */
  itemsPerSlide?: number;

  /**
   * Gap between items (in pixels)
   * @default 16
   */
  gap?: number;

  /**
   * Additional CSS class for the container
   */
  className?: string;
}

export const Carousel: FC<CarouselProps> = ({
  children,
  title,
  icon,
  onSeeAllClick,
  seeAllText = 'See All',
  itemsPerSlide = 3,
  gap = 16,
  className,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [maxScroll, setMaxScroll] = useState(0);

  // Calculate if we can scroll left or right
  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = scrollPosition < maxScroll;

  // Handle scroll events to update button states
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setMaxScroll(scrollWidth - clientWidth);
    }
  };

  // Scroll left or right
  const scrollTo = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const { clientWidth } = scrollContainerRef.current;
      const scrollAmount = clientWidth * 0.8; // Scroll 80% of the visible width

      if (direction === 'left') {
        scrollContainerRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with title and actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && <div className="mr-1">{icon}</div>}
          <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        </div>

        <div className="flex items-center gap-3">
          {onSeeAllClick && (
            <button
              onClick={onSeeAllClick}
              className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              {seeAllText}
            </button>
          )}

          <div className="flex gap-2">
            <button
              onClick={() => scrollTo('left')}
              disabled={!canScrollLeft}
              className={cn(
                'p-1.5 rounded-full border border-gray-200 shadow-sm',
                canScrollLeft
                  ? 'bg-white hover:bg-gray-50 text-gray-700'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              )}
              aria-label="Scroll left"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>

            <button
              onClick={() => scrollTo('right')}
              disabled={!canScrollRight}
              className={cn(
                'p-1.5 rounded-full border border-gray-200 shadow-sm',
                canScrollRight
                  ? 'bg-white hover:bg-gray-50 text-gray-700'
                  : 'bg-gray-50 text-gray-400 cursor-not-allowed'
              )}
              aria-label="Scroll right"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Scrollable carousel */}
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={handleScroll}
      >
        <div className="flex" style={{ gap: `${gap}px` }}>
          {children.map((child, index) => (
            <div
              key={index}
              className="flex-shrink-0 snap-start"
              style={{ width: `calc((100% - ${gap * (itemsPerSlide - 1)}px) / ${itemsPerSlide})` }}
            >
              {child}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
