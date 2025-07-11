'use client';

import { FC, useRef, useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { FundingCarouselItem } from './FundingCarouselItem';
import { useFundingFeed } from '@/hooks/useFundingFeed';
import { ArrowRight, ChevronLeft, ChevronRight, Coins } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

/**
 * Props for the FundingCarousel component.
 * Currently empty but defined as a specific empty object type for future extensibility.
 */
type FundingCarouselProps = Record<string, never>;

const CAROUSEL_ITEM_WIDTH = 250 + 12; // width + gap (updated to match BountiesCarousel)

export const FundingCarousel: FC<FundingCarouselProps> = () => {
  const { entries, isLoading, error } = useFundingFeed(10);
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

  if (isLoading) {
    // Simple loading state
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-6 my-12 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="flex space-x-4 overflow-hidden">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[290px] h-[180px] bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error || entries.length === 0) {
    // Don't render the carousel if there's an error or no data
    return null;
  }

  return (
    <div className="border-primary-100 my-12 relative">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-4 mb-4">
        <div className="flex-1 min-w-0">
          <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <span>
              <Icon name="fund" size={24} />
            </span>
            Fund Promising Research
          </h2>
          <p className="text-sm text-gray-600 font-medium mt-1">Support groundbreaking research.</p>
        </div>
        <div className="flex-shrink-0">
          <Link
            href="/fund"
            className="text-blue-600 hover:text-blue-700 flex items-center text-xs font-medium"
          >
            All Funding
            <ArrowRight size={14} className="ml-1" />
          </Link>
        </div>
      </div>

      {/* Carousel Container */}
      <div className="relative group">
        {/* Carousel Scroll Area */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex space-x-4 overflow-x-auto pb-1 scrollbar-hide relative" // pb-1 to prevent cutting off bottom border
        >
          {entries.map((entry: FeedEntry, index: number) => (
            <div
              key={entry.id}
              className={cn(
                // Apply dimming effect to the last visible item when not at end
                !isAtEnd && index === entries.length - 1 ? 'opacity-60' : 'opacity-100'
              )}
            >
              <FundingCarouselItem entry={entry} />
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
              background: 'linear-gradient(to right, rgba(255,255,255,0), rgba(255,255,255,0.7))',
            }}
          ></div>
        )}

        {/* Blur effect on the left side when scrolled */}
        {!isAtStart && (
          <div
            className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none z-10"
            style={{
              background: 'linear-gradient(to left, rgba(255,255,255,0), rgba(255,255,255,0.7))',
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
              <div className="flex items-center justify-center h-12 w-12 bg-black bg-opacity-40 hover:bg-opacity-60 rounded-full text-white">
                <ChevronRight size={24} />
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
