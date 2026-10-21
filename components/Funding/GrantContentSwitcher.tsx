'use client';

import { useEffect } from 'react';
import { useGrantActivity, useGrantPage } from '@/components/Funding/GrantPageContext';
import { DocumentSections } from '@/components/work/DocumentSections';
import { ActivityCard, ActivityFeedList } from '@/components/Activity';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { useFundraises } from '@/contexts/FundraiseContext';

/** Who can apply is what most readers of an RFP come for, so it opens with the first section. */
const isOpenOnRfp = (title: string, index: number) =>
  index === 0 || /eligib|who can apply/i.test(title);

interface GrantContentSwitcherProps {
  content?: string;
  showProposalFilters?: boolean;
}

/** The open tab's content on the RFP page: its details, its proposals or its activity. */
export function GrantContentSwitcher({
  content,
  showProposalFilters = false,
}: GrantContentSwitcherProps) {
  const { activeTab, setActiveTab } = useGrantPage();
  const activity = useGrantActivity();
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
        <DocumentSections
          content={content}
          emptyText="No details available for this grant."
          isOpenByDefault={isOpenOnRfp}
        />
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
