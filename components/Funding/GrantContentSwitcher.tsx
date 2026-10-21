'use client';

import { type ComponentProps, type ReactNode, useEffect } from 'react';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { DocumentSections } from '@/components/work/DocumentSections';
import { GrantFacts } from '@/components/Funding/GrantFacts';
import { GrantTabs } from '@/components/Funding/GrantTabs';
import { ActivityCard, ActivityFeedList } from '@/components/Activity';
import { ProposalFeed } from '@/components/Funding/ProposalFeed';
import { ProposalSortAndFilters } from '@/components/Funding/ProposalSortAndFilters';
import { useFeedScrollTracking } from '@/hooks/useFeedScrollTracking';
import { useFundraises } from '@/contexts/FundraiseContext';

interface GrantContentSwitcherProps {
  content?: string;
  facts: ComponentProps<typeof GrantFacts>;
  /** Sticky Apply and Fund buttons, shown only where the right sidebar is hidden. */
  actionBar?: ReactNode;
  showProposalFilters?: boolean;
}

export function GrantContentSwitcher({
  content,
  facts,
  actionBar,
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
      <GrantFacts {...facts} />
      <GrantTabs className="mt-4" />
      <div className={!isProposalsActive ? 'hidden' : undefined}>
        {showProposalFilters && <ProposalSortAndFilters />}
        <ProposalFeed isActive={isProposalsActive} />
      </div>
      <div className={activeTab !== 'details' ? 'hidden' : undefined}>
        <DocumentSections content={content} emptyText="No details available for this grant." />
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
      {actionBar}
    </>
  );
}
