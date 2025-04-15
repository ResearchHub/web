'use client';

import { FC, useRef, useState, useEffect, ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/utils/styles';

interface CarouselProps {
  children: ReactNode;
  itemWidth?: number; // Width of each item + gap
  scrollAmountMultiplier?: number; // How many items to scroll at once
  showBlur?: boolean; // Show blur effect at edges
  alwaysShowArrows?: boolean; // Option to always show navigation arrows
}

const DEFAULT_ITEM_WIDTH = 250 + 12; // Default width + gap, adjust as needed
const DEFAULT_SCROLL_MULTIPLIER = 2;

export const Carousel: FC<CarouselProps> = ({
  children,
  itemWidth = DEFAULT_ITEM_WIDTH,
  scrollAmountMultiplier = DEFAULT_SCROLL_MULTIPLIER,
  showBlur = true,
  alwaysShowArrows = false, // Default to false
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const scrollEndReached = scrollLeft >= scrollWidth - clientWidth - 5; // Tolerance
      setIsAtStart(scrollLeft <= 5); // Tolerance
      setIsAtEnd(scrollEndReached);
      setHasOverflow(scrollWidth > clientWidth + 5); // Check if content actually overflows
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = itemWidth * scrollAmountMultiplier;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // Effect to handle scroll state updates on mount, scroll, resize, and children change
  useEffect(() => {
    const currentRef = scrollContainerRef.current;
    const checkScroll = () => handleScroll();

    // Initial check after a short delay for rendering
    const timer = setTimeout(checkScroll, 100);

    window.addEventListener('resize', checkScroll);
    currentRef?.addEventListener('scroll', checkScroll);

    // Use MutationObserver to detect changes in children that might affect overflow
    const observer = new MutationObserver(checkScroll);
    if (currentRef) {
      observer.observe(currentRef, { childList: true, subtree: true });
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
      currentRef?.removeEventListener('scroll', checkScroll);
      observer.disconnect();
    };
  }, [children]); // Re-run when children change

  return (
    <div className="relative group">
      {/* Carousel Scroll Area */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex space-x-3 overflow-x-auto pb-1 scrollbar-hide relative" // pb-1 prevents cutting off bottom border
      >
        {children}
        {/* Add an extra invisible item to ensure last real item can scroll fully into view */}
        <div className="flex-shrink-0 w-px h-px"></div>
      </div>

      {/* Blur effect on the right side when more content is available */}
      {showBlur && !isAtEnd && hasOverflow && (
        <div
          className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.7))',
          }}
        ></div>
      )}

      {/* Blur effect on the left side when scrolled */}
      {showBlur && !isAtStart && hasOverflow && (
        <div
          className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
          style={{
            background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.7))',
          }}
        ></div>
      )}

      {/* Left Scroll Button - shown when not at start and content overflows */}
      {!isAtStart && hasOverflow && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center z-20">
          <button
            onClick={() => scroll('left')}
            className={cn(
              'flex items-center justify-center h-full w-16 focus:outline-none transition-opacity duration-200',
              alwaysShowArrows ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            aria-label="Scroll left"
          >
            <div className="flex items-center justify-center h-10 w-10 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full text-white">
              <ChevronLeft size={20} />
            </div>
          </button>
        </div>
      )}

      {/* Right Scroll Button - shown when not at end and content overflows */}
      {!isAtEnd && hasOverflow && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center z-20">
          <button
            onClick={() => scroll('right')}
            className={cn(
              'flex items-center justify-center h-full w-16 focus:outline-none transition-opacity duration-200',
              alwaysShowArrows ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            )}
            aria-label="Scroll right"
          >
            <div className="flex items-center justify-center h-10 w-10 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full text-white">
              <ChevronRight size={20} />
            </div>
          </button>
        </div>
      )}
    </div>
  );
};
