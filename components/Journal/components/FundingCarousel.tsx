'use client';

import { FC, useMemo } from 'react';
import { fundingStore } from '@/store/fundingStore';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import { FeedItemFundraise } from '@/components/Feed/items/FeedItemFundraise';
import Link from 'next/link';
import { Icon } from '@/components/ui/icons';

// Function to adapt funding store items to feed entries
const adaptFundingOpportunitiesToFeedEntries = (): FeedEntry[] => {
  return fundingStore.results.map((item) => {
    // Transform using the transformFeedEntry function, with proper type casting
    return transformFeedEntry(item as unknown as RawApiFeedEntry);
  });
};

export const FundingCarousel: FC = () => {
  // Transform funding opportunities to feed entries
  const fundingOpportunities = useMemo(() => adaptFundingOpportunitiesToFeedEntries(), []);

  return (
    <div className="mb-12">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div className="flex items-center gap-2.5 mb-3 sm:mb-0">
          <Icon name="earn1" color="#3b82f6" size={30} />
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Funding Opportunities</h2>
            <p className="text-sm text-gray-600">
              Support groundbreaking research by contributing to open funding requests.{' '}
              <Link href="/funding" className="text-blue-600 hover:underline ml-1">
                Learn more
              </Link>
            </p>
          </div>
        </div>
        <Link
          href="/funding/opportunities"
          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1 hover:underline"
        >
          View All Opportunities
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      </div>

      {/* Funding Opportunities Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {fundingOpportunities.slice(0, 4).map((entry) => {
          const post = entry.content as any;
          const fundingUrl = `/fund/${post.id}/${post.slug}`;

          return (
            <div key={entry.id} className="h-full">
              <FeedItemFundraise
                entry={entry}
                href={fundingUrl}
                showTooltips={false}
                compact={true}
                className="h-full"
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};
