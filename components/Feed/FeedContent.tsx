'use client';

import { FC, ReactNode, useEffect } from 'react';
import React from 'react';
import { usePathname } from 'next/navigation';
import { FeedItemSkeleton, FeedSkeletonVariant } from './FeedItemSkeleton';
import { useInView } from 'react-intersection-observer';
import { FeedEntry } from '@/types/feed';
import { FeedEntryItem, Highlight } from './FeedEntryItem';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { useFeedImpressionTracking } from '@/hooks/useFeedImpressionTracking';
import { useContentTabsVisibilitySentinel } from '@/hooks/useContentTabsVisibilitySentinel';
import { useFeedStateRestoration } from '@/hooks/useFeedStateRestoration';

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
  activeTab?: string;
  showBountyFooter?: boolean;
  hideActions?: boolean;
  isLoadingMore?: boolean;
  noEntriesElement?: ReactNode;
  maxLength?: number;
  showGrantHeaders?: boolean;
  showFundraiseHeaders?: boolean;
  showPostHeaders?: boolean;
  showReadMoreCTA?: boolean;
  showGrantApplyCta?: boolean;
  ordering?: string;
  restoredScrollPosition?: number | null;
  page?: number;
  lastClickedEntryId?: string;
  persistedFilters?: Record<string, string>;
  insertContent?: InsertContentItem[];
  shouldRenderBountyAsComment?: boolean;
  showBountyInfo?: boolean;
  abstractCollapsedByDefault?: boolean;
  renderEntry?: (props: {
    entry: FeedEntry;
    index: number;
    ordering?: string;
    registerVisibleItem: (index: number, unifiedDocumentId: string) => void;
    unregisterVisibleItem: (index: number, unifiedDocumentId: string) => void;
    getVisibleItems: (clickedUnifiedDocumentId: string) => string[];
  }) => ReactNode;
  /**
   * Drop the default `max-w-4xl` cap on the feed list so it fills its parent.
   * Use when the surrounding layout is already wider (e.g. sidebar-less pages).
   */
  wideContent?: boolean;
  skeletonVariant?: FeedSkeletonVariant;
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
  showGrantApplyCta = true,
  ordering,
  restoredScrollPosition,
  page,
  lastClickedEntryId,
  persistedFilters,
  insertContent,
  shouldRenderBountyAsComment,
  showBountyInfo = false,
  abstractCollapsedByDefault,
  renderEntry,
  wideContent = false,
  skeletonVariant,
}) => {
  const pathname = usePathname();
  const tabsSentinelRef = useContentTabsVisibilitySentinel(!!tabs);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const { feedKey } = useFeedStateRestoration({
    activeTab: pathname === '/search' ? undefined : activeTab,
    shouldRestore: () => false,
  });

  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition,
    lastClickedEntryId,
    filters: persistedFilters,
  });

  const { registerVisibleItem, unregisterVisibleItem, getVisibleItems } =
    useFeedImpressionTracking();

  const displayEntries = entries;
  const showLoadingSkeletons = isLoading || isLoadingMore;
  const skeletonCount = 3;
  const resolvedSkeletonVariant = skeletonVariant ?? 'paper';

  useEffect(() => {
    if (inView && hasMore && !showLoadingSkeletons) {
      loadMore();
    }
  }, [inView, hasMore, showLoadingSkeletons, loadMore]);

  return (
    <>
      {header}

      <div className={wideContent ? undefined : 'max-w-4xl mx-auto'}>
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

              const feedItem = renderEntry ? (
                renderEntry({
                  entry,
                  index,
                  ordering,
                  registerVisibleItem,
                  unregisterVisibleItem,
                  getVisibleItems,
                })
              ) : (
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
                  showGrantApplyCta={showGrantApplyCta}
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
                  <FeedItemSkeleton
                    key={`skeleton-${index}`}
                    variant={resolvedSkeletonVariant}
                    hideActions={hideActions}
                    showHeader={showPostHeaders}
                    showGrantApplyCta={showGrantApplyCta}
                  />
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
