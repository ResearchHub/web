'use client';

import { useEffect, useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { useInView } from 'react-intersection-observer';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { GrantDetailsInline } from '@/components/Funding/GrantDetailsInline';
import { ActivityCard, ActivityCardSkeleton } from '@/components/Activity';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { getFeedKey } from '@/contexts/NavigationContext';
import { useFundraises } from '@/contexts/FundraiseContext';

interface GrantContentSwitcherProps {
  content?: string;
  imageUrl?: string;
  showProposalFilters?: boolean;
}

export function GrantContentSwitcher({
  content,
  imageUrl,
  showProposalFilters = false,
}: GrantContentSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { activeTab, setActiveTab, activity } = useGrantTab();
  const { restoredScrollPosition: proposalsRestoredScrollPosition } = useFundraises();
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = activity;

  const isProposalsActive = activeTab === 'proposals';
  const isActivityActive = activeTab === 'activity';

  useEffect(() => {
    if (proposalsRestoredScrollPosition != null) {
      setActiveTab('proposals');
    } else if (restoredScrollPosition != null) {
      setActiveTab('activity');
    }
  }, [proposalsRestoredScrollPosition, restoredScrollPosition, setActiveTab]);

  const feedKey = useMemo(() => {
    const queryParams: Record<string, string> = {};
    for (const [key, value] of searchParams) {
      queryParams[key] = value;
    }
    return getFeedKey({
      pathname,
      tab: restorationTab,
      queryParams: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    });
  }, [pathname, restorationTab, searchParams]);

  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition: isActivityActive ? restoredScrollPosition : null,
    lastClickedEntryId: isActivityActive ? (lastClickedEntryId ?? undefined) : undefined,
  });

  const { ref: sentinelRef } = useInView({
    threshold: 0,
    rootMargin: '200px',
    onChange: (inView) => {
      if (inView && hasMore && !isLoading && !isLoadingMore) {
        loadMore();
      }
    },
  });

  return (
    <>
      <div className={!isProposalsActive ? 'hidden' : undefined}>
        {showProposalFilters && <ProposalSortAndFilters />}
        <ProposalFeed isActive={isProposalsActive} />
      </div>
      <div className={activeTab !== 'details' ? 'hidden' : undefined}>
        <GrantDetailsInline content={content} imageUrl={imageUrl} />
      </div>
      <div className={!isActivityActive ? 'hidden' : undefined}>
        <div>
          {entries.map((entry) => (
            <ActivityCard key={entry.id} entry={entry} />
          ))}

          {(isLoading || isLoadingMore) &&
            [...Array(8)].map((_, i) => <ActivityCardSkeleton key={i} />)}

          {!isLoading && !isLoadingMore && entries.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-gray-500">No activity found</p>
            </div>
          )}

          {!isLoading && !isLoadingMore && hasMore && <div ref={sentinelRef} className="h-10" />}
        </div>
      </div>
    </>
  );
}
