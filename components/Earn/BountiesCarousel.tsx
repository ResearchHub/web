'use client';

import { FC, useRef, useState, useEffect } from 'react';
import { FeedEntry } from '@/types/feed';
import { useBountiesFeed } from '@/hooks/useBountiesFeed';
import { ArrowRight, ChevronLeft, ChevronRight, UserCheck } from 'lucide-react';
import Icon from '@/components/ui/icons/Icon';
import { cn } from '@/utils/styles';
import Link from 'next/link';
import { BountyCarouselItem } from './BountyCarouselItem';
import { Carousel } from '@/components/ui/Carousel';

/**
 * Props for the BountiesCarousel component.
 * Currently empty but defined as a specific empty object type for future extensibility.
 */
type BountiesCarouselProps = Record<string, never>;

const CAROUSEL_ITEM_WIDTH = 250 + 12; // width + gap

export const BountiesCarousel: FC<BountiesCarouselProps> = () => {
  // Let's specifically fetch review bounties for our carousel
  const { entries, isLoading, error } = useBountiesFeed(10, 'OPEN', 'REVIEW');

  if (isLoading) {
    // Simple loading state
    return (
      <div className="bg-gray-100 border border-gray-200 rounded-lg p-5 my-8 animate-pulse">
        <div className="h-5 bg-gray-200 rounded w-1/3 mb-3"></div>
        <div className="flex space-x-3 overflow-hidden">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex-shrink-0 w-[250px] h-[150px] bg-gray-200 rounded-lg"></div>
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
    <div className="my-8 relative">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
            <span>
              <Icon name="earn1" size={20} />
            </span>
            Earning Opportunities
          </h2>
          <p className="text-sm text-gray-600 font-medium mt-1">
            Get paid <span>150 USD</span> to peer review papers
          </p>
        </div>
        <Link href="/earn" className="text-blue-600 hover:text-blue-700 flex items-center text-xs">
          View All Opportunities
          <ArrowRight size={14} className="ml-1" />
        </Link>
      </div>

      {/* Carousel Container - Use the new Carousel component */}
      <div className="relative group">
        <Carousel itemWidth={CAROUSEL_ITEM_WIDTH} scrollAmountMultiplier={2}>
          {entries.map((entry: FeedEntry, index: number) => (
            <div
              key={entry.id}
              className="flex-shrink-0" // Removed dimming logic, could be added back if needed
            >
              <BountyCarouselItem entry={entry} />
            </div>
          ))}
        </Carousel>
      </div>
    </div>
  );
};
