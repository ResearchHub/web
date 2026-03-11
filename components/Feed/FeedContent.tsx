'use client';

import { FC, ReactNode, useEffect, useRef } from 'react';
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
import { useFeedTabsVisibility } from '@/contexts/FeedTabsVisibilityContext';
import { useScrollContainer } from '@/contexts/ScrollContainerContext';

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
  banner?: ReactNode;
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
  showBountyInfo?: boolean;
  abstractCollapsedByDefault?: boolean;
}

export const FeedContent: FC<FeedContentProps> = ({
  entries,
  isLoading,
  hasMore,
  loadMore,
  header,
  tabs,
  filters,
  banner,
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
  showBountyInfo = false,
  abstractCollapsedByDefault,
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setContentTabsHidden } = useFeedTabsVisibility();
  const scrollContainerRef = useScrollContainer();
  const tabsSentinelRef = useRef<HTMLDivElement>(null);

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
  const showLoadingSkeletons = isLoading || isLoadingMore;
  const skeletonCount = 3;

  useEffect(() => {
    if (inView && hasMore && !showLoadingSkeletons) {
      loadMore();
    }
  }, [inView, hasMore, showLoadingSkeletons, loadMore]);

  useEffect(() => {
    const sentinel = tabsSentinelRef.current;
    if (!sentinel || !tabs) return;

    const root = scrollContainerRef?.current ?? null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        setContentTabsHidden(!entry.isIntersecting);
      },
      { root, threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [tabs, scrollContainerRef, setContentTabsHidden]);

  useEffect(() => {
    if (!tabs) return;
    return () => setContentTabsHidden(false);
  }, [tabs, setContentTabsHidden]);

  return (
    <>
      {header && <div className="mb-2">{header}</div>}

      <div className="max-w-4xl mx-auto">
        {tabs && <div ref={tabsSentinelRef}>{tabs}</div>}

        {filters && <div>{filters}</div>}

        {banner && <div className="pt-3 pb-0">{banner}</div>}

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
                  abstractCollapsedByDefault={abstractCollapsedByDefault}
                />
              );

              return (
                <React.Fragment key={`${entry.id}-${index}`}>
                  {feedItem}
                  {contentToInsert && (
                    <div key={`insert-content-${index}`} className="mt-8">
                      {contentToInsert.content}
                    </div>
                  )}
                </React.Fragment>
              );
            })}

          {showLoadingSkeletons && (
            <div className={displayEntries.length > 0 ? 'mt-8' : ''}>
              <div className="space-y-8">
                {[...Array(skeletonCount)].map((_, index) => (
                  <FeedItemSkeleton key={`skeleton-${index}`} />
                ))}
              </div>
            </div>
          )}

          {!isLoading &&
            !isLoadingMore &&
            displayEntries.length === 0 &&
            (noEntriesElement || (
              <div className="text-center py-8">
                <p className="text-gray-500">No feed entries found</p>
              </div>
            ))}
        </div>

        {/* Infinite scroll sentinel */}
        {!showLoadingSkeletons && hasMore && <div ref={loadMoreRef} className="h-10" />}
      </div>
    </>
  );
};
