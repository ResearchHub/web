'use client';

import { useEffect, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { FeedContent } from '@/components/Feed/FeedContent';
import { GrantSortAndFilters } from '@/components/Funding/GrantSortAndFilters';
import { isFoundationUser } from '@/components/Bounty/lib/bountyUtil';
import { FOUNDATION_ORGANIZATION_NAME, FOUNDATION_RFP_MIN_USD } from '@/config/constants';
import {
  SHOW_ALL_RFPS_PARAM,
  isTrueParam,
} from '@/components/Funding/IncludePrivateProposalsControl';
import { useGrantFeed } from '@/contexts/GrantFeedContext';
import { useUser } from '@/contexts/UserContext';
import { isHubEditorOrModerator } from '@/utils/permissions';
import type { FeedEntry, FeedGrantContent } from '@/types/feed';
import { getGrantBadgeAmount } from '@/types/grant';

/**
 * The Foundation opens many placeholder RFPs; only show the ones that carry real
 * money (grant amount plus whatever its pool has raised).
 */
function isUnderfundedFoundationRfp(entry: FeedEntry): boolean {
  if (entry.contentType !== 'GRANT') return false;
  const { grant } = entry.content as FeedGrantContent;
  if (!grant) return false;

  const isFoundation =
    grant.organization?.trim() === FOUNDATION_ORGANIZATION_NAME ||
    isFoundationUser(grant.createdBy?.user?.id);
  return isFoundation && getGrantBadgeAmount(grant).usd < FOUNDATION_RFP_MIN_USD;
}

export function FundGrantsPageContent() {
  const {
    entries,
    isLoading,
    isLoadingMore,
    hasMore,
    page,
    loadMore,
    sortBy,
    setSortBy,
    activate,
    restoredScrollPosition,
    lastClickedEntryId,
    restorationTab,
  } = useGrantFeed();

  useEffect(() => {
    activate();
  }, [activate]);

  const persistedFilters = useMemo(() => ({ sortBy }), [sortBy]);
  const { user } = useUser();
  const searchParams = useSearchParams();
  // Admins can reveal everything from the shield menu on the RFPs tab.
  const showAllRfps =
    isHubEditorOrModerator(user) && isTrueParam(searchParams.get(SHOW_ALL_RFPS_PARAM));
  const visibleEntries = useMemo(
    () => (showAllRfps ? entries : entries.filter((entry) => !isUnderfundedFoundationRfp(entry))),
    [entries, showAllRfps]
  );

  return (
    <FeedContent
      entries={visibleEntries}
      isLoading={isLoading}
      isLoadingMore={isLoadingMore}
      hasMore={hasMore}
      loadMore={loadMore}
      filters={<GrantSortAndFilters sortBy={sortBy} onSortChange={setSortBy} />}
      skeletonVariant="grant"
      showGrantHeaders={false}
      showPostHeaders={false}
      showFundraiseHeaders={false}
      activeTab={restorationTab}
      restoredScrollPosition={restoredScrollPosition}
      page={page}
      lastClickedEntryId={lastClickedEntryId ?? undefined}
      persistedFilters={persistedFilters}
      noEntriesElement={
        <div className="py-12 text-center">
          <p className="text-gray-400 text-sm">No open awards right now</p>
        </div>
      }
    />
  );
}
