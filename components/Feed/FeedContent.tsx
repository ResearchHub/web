'use client';

import { FC, ReactNode, useEffect, useRef } from 'react';
import React from 'react';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { FeedTab } from '@/hooks/useFeed'; // Import FeedTab type
import { Button } from '../ui/Button';
import { FundingCarousel } from '@/components/Fund/FundingCarousel';
import { BountiesCarousel } from '@/components/Earn/BountiesCarousel';
import { FeedEntryItem } from './FeedEntryItem';
import { useFeedContentTracking } from '@/contexts/FeedContentTracking';

interface FeedContentProps {
  entries: FeedEntry[]; // Using FeedEntry type instead of RawApiFeedEntry
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  header?: ReactNode;
  tabs?: ReactNode;
  filters?: ReactNode; // New prop for source filters
  disableCardLinks?: boolean; // Optional prop to disable all card links
  activeTab?: FeedTab; // Add the activeTab prop as optional
  showBountyFooter?: boolean; // Prop to control bounty item footer visibility
  hideActions?: boolean; // Prop to control comment item actions visibility
  isLoadingMore?: boolean;
  showBountySupportAndCTAButtons?: boolean; // Show container for Support and CTA buttons for bounty items
  showBountyDeadline?: boolean; // Show deadline in metadata line
  noEntriesElement?: ReactNode; // Element to render if there are no entries
  maxLength?: number;
  showGrantHeaders?: boolean; // Prop to control grant header visibility
  showReadMoreCTA?: boolean; // Prop to control read more CTA visibility
}

export const FeedContent: FC<FeedContentProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  header,
  tabs,
  filters,
  disableCardLinks = false,
  activeTab, // Destructure activeTab
  showBountyFooter = true, // Default to true
  hideActions = false,
  isLoadingMore = false,
  showBountySupportAndCTAButtons = true, // Show container for Support and CTA buttons
  showBountyDeadline = true, // Show deadline in metadata line
  noEntriesElement,
  maxLength,
  showGrantHeaders = true, // Default to true
  showReadMoreCTA = false,
}) => {
  const { processAndReset } = useFeedContentTracking();
  const processAndResetRef = useRef(processAndReset);

  useEffect(() => {
    processAndResetRef.current = processAndReset;
  }, [processAndReset]);

  // Set up intersection observer for infinite scrolling (must be called before any conditional returns)
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Trigger load more when the sentinel element is in view
  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  // Process and reset when FeedContent unmounts
  useEffect(() => {
    return () => {
      processAndResetRef.current();
    };
  }, []);

  return (
    <>
      {header && <div>{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs && <div className="border-b">{tabs}</div>}

        {filters && <div className="py-3">{filters}</div>}

        <div className="mt-4">
          {/* Render existing entries using the new FeedEntryItem component */}
          {entries.length > 0 &&
            entries.map((entry, index) => (
              <React.Fragment key={entry.id}>
                <FeedEntryItem
                  entry={entry}
                  index={index}
                  disableCardLinks={disableCardLinks}
                  showBountyFooter={showBountyFooter}
                  hideActions={hideActions}
                  showBountySupportAndCTAButtons={showBountySupportAndCTAButtons}
                  showBountyDeadline={showBountyDeadline}
                  maxLength={maxLength}
                  showGrantHeaders={showGrantHeaders}
                  showReadMoreCTA={showReadMoreCTA}
                />
                {activeTab === 'popular' && index === 2 && <FundingCarousel />}
                {activeTab === 'popular' && index === 8 && <BountiesCarousel />}
              </React.Fragment>
            ))}

          {/* Show skeletons when loading (initial or load more) */}
          {isLoading && (
            <>
              {[...Array(3)].map((_, index) => (
                // Add margin-top if it's not the very first skeleton overall (i.e., if there are entries or previous skeletons)
                <div
                  key={`skeleton-${index}`}
                  className={index > 0 || entries.length > 0 ? 'mt-12' : ''}
                >
                  <FeedItemSkeleton />
                </div>
              ))}
            </>
          )}

          {/* Show 'No entries' message only if not loading and entries are empty */}
          {!isLoading &&
            entries.length === 0 &&
            (noEntriesElement || (
              <div className="text-center py-8">
                <p className="text-gray-500">No feed entries found</p>
              </div>
            ))}
        </div>

        {/* Infinite scroll sentinel */}
        {!isLoading && hasMore && (
          <div ref={loadMoreRef} className="h-10 flex items-center justify-center">
            {isLoadingMore && <span className="text-sm text-gray-500">Loading more...</span>}
          </div>
        )}
      </div>
    </>
  );
};
