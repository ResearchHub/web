'use client';

import { FC, useRef, useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { JournalHighlightItem } from './JournalHighlightItem';
import { ArrowRight, ChevronLeft, ChevronRight, Pin } from 'lucide-react';
import { cn } from '@/utils/styles';
import Link from 'next/link';

/**
 * Props for the JournalHighlightsCarousel component.
 */
type JournalHighlightsCarouselProps = {
  highlights: FeedEntry[];
};

const CAROUSEL_ITEM_WIDTH = 320 + 16; // width + gap

export const JournalHighlightsCarousel: FC<JournalHighlightsCarouselProps> = ({ highlights }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [isAtStart, setIsAtStart] = useState(true);
  const [isAtEnd, setIsAtEnd] = useState(false);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setIsAtStart(scrollLeft <= 5); // Allow some tolerance
      setIsAtEnd(scrollLeft >= scrollWidth - clientWidth - 5); // Allow some tolerance
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = CAROUSEL_ITEM_WIDTH * 2; // Scroll by 2 items
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  // useEffect to handle scroll state updates on mount, scroll, and resize
  useEffect(() => {
    const currentRef = scrollContainerRef.current;
    const checkScroll = () => handleScroll();

    // Initial check
    const timer = setTimeout(checkScroll, 100); // Check shortly after mount

    // Listeners
    window.addEventListener('resize', checkScroll);
    currentRef?.addEventListener('scroll', checkScroll);

    // Cleanup
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', checkScroll);
      currentRef?.removeEventListener('scroll', checkScroll);
    };
  }, []); // Empty dependency array ensures this runs only on mount and unmount

  if (highlights.length === 0) {
    return null;
  }

  return (
    <div className="my-6 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <Pin className="w-4 h-4 text-amber-600 rotate-45" strokeWidth={2.5} />
            Journal Highlights
          </h2>
          <p className="text-sm text-gray-600 mt-1">Editor's choice and most impactful research</p>
        </div>
        <Link
          href="/hub/bioscience/highlights"
          className="text-blue-600 hover:text-blue-700 flex items-center text-sm font-medium"
        >
          View All Highlights
          <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Carousel Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex space-x-4 overflow-x-auto pb-1 scrollbar-hide relative" // pb-1 to prevent cutting off bottom border
        >
          {highlights.map((highlight: FeedEntry, index: number) => (
            <div
              key={highlight.id}
              className={cn(
                // Apply dimming effect to the last visible item when not at end
                !isAtEnd && index === highlights.length - 1 ? 'opacity-60' : 'opacity-100'
              )}
            >
              <JournalHighlightItem entry={highlight} />
            </div>
          ))}
          {/* Add an extra invisible item to ensure last real item can scroll fully into view */}
          <div className="flex-shrink-0 w-px h-px"></div>
        </div>

        {/* Blur effect on the right side when more content is available */}
        {!isAtEnd && (
          <div
            className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.8))',
            }}
          ></div>
        )}

        {/* Blur effect on the left side when scrolled */}
        {!isAtStart && (
          <div
            className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.8))',
            }}
          ></div>
        )}

        {/* Left Scroll Button - shown when not at start */}
        {!isAtStart && (
          <div className="absolute left-0 top-0 bottom-0 flex items-center z-20">
            <button
              onClick={() => scroll('left')}
              className="flex items-center justify-center h-full w-16 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Scroll left"
            >
              <div className="flex items-center justify-center h-12 w-12 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full text-white">
                <ChevronLeft size={24} />
              </div>
            </button>
          </div>
        )}

        {/* Right Scroll Button - shown when not at end */}
        {!isAtEnd && (
          <div className="absolute right-[-20px] top-0 bottom-0 flex items-center z-20">
            <button
              onClick={() => scroll('right')}
              className="flex items-center justify-center h-full w-16 focus:outline-none opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              aria-label="Scroll right"
            >
              <div className="flex items-center justify-center h-12 w-12 bg-black bg-opacity-60 hover:bg-opacity-70 rounded-full text-white">
                <ChevronRight size={24} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
