'use client';

import { FC, ReactNode, useEffect } from 'react';
import React from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { FeedItemSkeleton } from './FeedItemSkeleton';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { FeedTab, FundingTab } from '@/hooks/useFeed';
import { TabType } from '@/components/Journal/JournalTabs';
import { FeedEntryItem, Highlight } from './FeedEntryItem';
import { getFeedKey } from '@/contexts/NavigationContext';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { useFeedImpressionTracking } from '@/hooks/useFeedImpressionTracking';

interface InsertContentItem {
  index: number;
  content: ReactNode;
}

interface FeedContentProps {
  entries: FeedEntry[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
  header?: ReactNode;
  tabs?: ReactNode;
  filters?: ReactNode;
  activeTab?: FeedTab | FundingTab | TabType | string;
  showBountyFooter?: boolean;
  hideActions?: boolean;
  isLoadingMore?: boolean;
  noEntriesElement?: ReactNode;
  maxLength?: number;
  showGrantHeaders?: boolean;
  showFundraiseHeaders?: boolean;
  showPostHeaders?: boolean;
  showReadMoreCTA?: boolean;
  ordering?: string;
  restoredScrollPosition?: number | null;
  page?: number;
  lastClickedEntryId?: string;
  insertContent?: InsertContentItem[];
  shouldRenderBountyAsComment?: boolean;
  wrapped?: (item: ReactNode, entry: FeedEntry, index: number) => ReactNode;
  showBountyInfo?: boolean;
}

export const FeedContent: FC<FeedContentProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  header,
  tabs,
  filters,
  activeTab,
  showBountyFooter = true,
  hideActions = false,
  isLoadingMore = false,
  noEntriesElement,
  maxLength,
  showGrantHeaders = true,
  showFundraiseHeaders = true,
  showPostHeaders = true,
  showReadMoreCTA = false,
  ordering,
  restoredScrollPosition,
  page,
  lastClickedEntryId,
  insertContent,
  shouldRenderBountyAsComment,
  wrapped,
  showBountyInfo = false,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  // Build query params from URL for feed key
  const queryParams: Record<string, string> = {};
  for (const [key, value] of searchParams) {
    queryParams[key] = value;
  }

  // Generate feed key from pathname/tab/queryParams
  // For search pages, explicitly exclude tab portion
  const feedKey = getFeedKey({
    pathname,
    tab: pathname === '/search' ? undefined : activeTab,
    queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
  });

  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition,
    lastClickedEntryId,
  });

  const { registerVisibleItem, unregisterVisibleItem, getVisibleItems } =
    useFeedImpressionTracking();

  const displayEntries = entries;

  useEffect(() => {
    if (inView && hasMore && !isLoading && !isLoadingMore) {
      loadMore();
    }
  }, [inView, hasMore, isLoading, isLoadingMore, loadMore]);

  return (
    <>
      {header && <div>{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs && <div className="border-b">{tabs}</div>}

        {filters && <div className="py-3">{filters}</div>}

        <div className="mt-4">
          {displayEntries.length > 0 &&
            displayEntries.map((entry, index) => {
              const contentToInsert = insertContent?.find((item) => item.index === index);

              // Extract highlights from searchMetadata if present
              const highlights: Highlight[] = [];
              if (entry.searchMetadata) {
                if (entry.searchMetadata.highlightedTitle) {
                  highlights.push({ field: 'title', value: entry.searchMetadata.highlightedTitle });
                }
                if (entry.searchMetadata.highlightedSnippet) {
                  highlights.push({
                    field: 'snippet',
                    value: entry.searchMetadata.highlightedSnippet,
                  });
                }
              }

              const feedItem = (
                <FeedEntryItem
                  showPostHeaders={showPostHeaders}
                  showBountyInfo={showBountyInfo}
                  highlights={highlights}
                  shouldRenderBountyAsComment={shouldRenderBountyAsComment}
                  entry={entry}
                  index={index}
                  showBountyFooter={showBountyFooter}
                  hideActions={hideActions}
                  maxLength={maxLength}
                  showGrantHeaders={showGrantHeaders}
                  showFundraiseHeaders={showFundraiseHeaders}
                  showReadMoreCTA={showReadMoreCTA}
                  feedOrdering={ordering}
                  registerVisibleItem={registerVisibleItem}
                  unregisterVisibleItem={unregisterVisibleItem}
                  getVisibleItems={getVisibleItems}
                />
              );

              const effectiveFeedItem = wrapped ? wrapped(feedItem, entry, index) : feedItem;

              return (
                <React.Fragment key={`${entry.id}-${index}`}>
                  {effectiveFeedItem}
                  {contentToInsert && (
                    <div key={`insert-content-${index}`} className="mt-12">
                      {contentToInsert.content}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          {isLoading && (
            <>
              {[...Array(3)].map((_, index) => (
                <div
                  key={`skeleton-${index}`}
                  className={index > 0 || displayEntries.length > 0 ? 'mt-12' : ''}
                >
                  <FeedItemSkeleton />
                </div>
              ))}
            </>
          )}

          {/* Show 'No entries' message only if not loading and entries are empty */}
          {!isLoading &&
            displayEntries.length === 0 &&
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
