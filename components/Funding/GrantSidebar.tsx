'use client';

import { GrantPoolCard } from '@/components/Funding/GrantPoolCard';
import { useGrantActivity, useGrantPage } from '@/components/Funding/GrantPageContext';
import { RecentActivityCard } from '@/components/Activity/RecentActivityCard';
import { ID } from '@/types/root';

/** The RFP page's right sidebar: the pool card over the RFP's activity. */
export function GrantSidebar({
  currentDocumentId,
}: {
  /** The RFP's own post, so the activity list doesn't repeat its title. */
  currentDocumentId?: ID;
}) {
  return (
    <div className="flex flex-col gap-3">
      <GrantPoolCard />
      <GrantRecentActivity currentDocumentId={currentDocumentId} />
    </div>
  );
}

/**
 * The feed the page already loads for the Activity tab, which "See all" opens.
 * Its own component, so the feed's updates re-render only this card.
 */
function GrantRecentActivity({ currentDocumentId }: { currentDocumentId?: ID }) {
  const { showTab } = useGrantPage();
  const { entries, isLoading, hasMore } = useGrantActivity();

  return (
    <RecentActivityCard
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      currentDocumentId={currentDocumentId}
      onSeeAll={() => showTab('activity')}
    />
  );
}
