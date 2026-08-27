'use client';

import { useEffect } from 'react';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { GrantDetailsInline } from '@/components/Funding/GrantDetailsInline';
import { ActivityCard, ActivityFeedList } from '@/components/Activity';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
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
  const { activeTab, setActiveTab, activity } = useGrantTab();
  const { restoredScrollPosition: proposalsRestoredScrollPosition } = useFundraises();
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    feedKey,
    restoredScrollPosition,
    lastClickedEntryId,
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

  useFeedScrollTracking({
    feedKey,
    entries,
    hasMore,
    page,
    restoredScrollPosition: isActivityActive ? restoredScrollPosition : null,
    lastClickedEntryId: isActivityActive ? (lastClickedEntryId ?? undefined) : undefined,
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
        <ActivityFeedList
          isLoading={isLoading}
          isLoadingMore={isLoadingMore}
          hasMore={hasMore}
          loadMore={loadMore}
          isEmpty={entries.length === 0}
        >
          {entries.map((entry) => (
            <ActivityCard key={entry.id} entry={entry} />
          ))}
        </ActivityFeedList>
      </div>
    </>
  );
}
