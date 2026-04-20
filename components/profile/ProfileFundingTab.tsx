'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FeedContent } from '@/components/Feed/FeedContent';
import { PillTabs } from '@/components/ui/PillTabs';
import { useFeed } from '@/hooks/useFeed';

const PILL_GRANTS = { id: 'grants', label: 'Funding Opportunities' };
const PILL_PROPOSALS = { id: 'proposals', label: 'Proposals' };
export const FUNDING_PILLS = [PILL_GRANTS, PILL_PROPOSALS];

export type FundingPillId = 'grants' | 'proposals';

export function isFundingPill(id: string): id is FundingPillId {
  return id === 'grants' || id === 'proposals';
}

interface ProfileFundingTabProps {
  /** User id of the profile being viewed. */
  userId: number;
  /** Current tab id from URL (may be a pill id or the group id 'funding'). */
  currentTab: string;
  /** Called when user clicks a pill. */
  onPillChange: (pillId: FundingPillId) => void;
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="py-12 text-center">
      <p className="text-gray-400 text-sm">{label}</p>
    </div>
  );
}

/**
 * Funding tab — shows Funding Opportunities and Proposals as pills. Both feeds
 * are fetched in parallel; a loading skeleton replaces the pill bar and content
 * until both requests complete for the first time. After that, background
 * refetches keep the pills visible and surface via `FeedContent`'s own spinner
 * so the UI doesn't flash. The default pill is "Funding Opportunities" if the
 * user is a funder (has any grants), otherwise "Proposals".
 */
export function ProfileFundingTab({ userId, currentTab, onPillChange }: ProfileFundingTabProps) {
  const grantsOpts = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      contentType: 'GRANT',
      createdBy: userId,
      ordering: 'newest',
    }),
    [userId]
  );
  const proposalsOpts = useMemo(
    () => ({
      endpoint: 'funding_feed' as const,
      contentType: 'PREREGISTRATION',
      createdBy: userId,
      ordering: 'newest',
    }),
    [userId]
  );

  const grantsFeed = useFeed('all', grantsOpts);
  const proposalsFeed = useFeed('all', proposalsOpts);

  // Latch "both feeds have completed at least one load" so subsequent
  // background refetches don't fall back to the skeleton.
  const [hasEverLoaded, setHasEverLoaded] = useState(
    !grantsFeed.isLoading && !proposalsFeed.isLoading
  );
  useEffect(() => {
    if (!grantsFeed.isLoading && !proposalsFeed.isLoading) {
      setHasEverLoaded(true);
    }
  }, [grantsFeed.isLoading, proposalsFeed.isLoading]);

  // Freeze the pill order at the moment of first-load resolution so a refetch
  // that briefly returns an empty grants list doesn't shuffle the pills.
  const pillOrderRef = useRef<typeof FUNDING_PILLS | null>(null);
  if (hasEverLoaded && pillOrderRef.current === null) {
    pillOrderRef.current =
      grantsFeed.entries.length === 0 ? [PILL_PROPOSALS, PILL_GRANTS] : FUNDING_PILLS;
  }

  // If URL specifies a pill, use it. Otherwise pick the default once both
  // feeds have completed at least once.
  const explicitPill = isFundingPill(currentTab) ? currentTab : null;
  const defaultPill: FundingPillId = grantsFeed.entries.length > 0 ? 'grants' : 'proposals';
  const activePill = explicitPill ?? (hasEverLoaded ? defaultPill : null);

  if (!activePill) {
    // Skeleton while both feeds are fetching the first time — hides both the
    // pill bar and content.
    return (
      <FeedContent
        entries={[]}
        isLoading={true}
        hasMore={false}
        loadMore={() => {}}
        showGrantHeaders={false}
        showPostHeaders={false}
        showFundraiseHeaders={false}
      />
    );
  }

  const activeFeed = activePill === 'grants' ? grantsFeed : proposalsFeed;
  const emptyLabel = activePill === 'grants' ? 'No funding opportunities yet' : 'No proposals yet';
  const pills = pillOrderRef.current ?? FUNDING_PILLS;

  return (
    <div>
      <div className="mb-4">
        <PillTabs
          tabs={pills}
          activeTab={activePill}
          onTabChange={(id) => onPillChange(id as FundingPillId)}
          size="sm"
        />
      </div>
      <FeedContent
        entries={activeFeed.entries}
        isLoading={activeFeed.isLoading}
        hasMore={activeFeed.hasMore}
        loadMore={activeFeed.loadMore}
        showGrantHeaders={false}
        showPostHeaders={false}
        showFundraiseHeaders={false}
        noEntriesElement={<EmptyState label={emptyLabel} />}
      />
    </div>
  );
}
