'use client';

import { RecentlyVisited } from '@/components/RecentlyVisited/RecentlyVisited';
import { OpenFundingList, OpenFundingListSkeleton } from '@/components/Funding/OpenFundingList';
import { useOpenFunding } from '@/hooks/useOpenFunding';

/** Rows per section, so all three fit the column on a laptop screen. */
const LIST_SIZE = 3;

/**
 * The home tabs' right sidebar: the viewer's recently visited pages when they
 * have any, then open RFPs and open proposals, so a new visitor never meets an
 * empty column.
 */
export function HomeSidebar() {
  const { rfps, proposals, isLoading } = useOpenFunding(LIST_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <RecentlyVisited limit={LIST_SIZE} />
      {isLoading ? (
        <>
          <OpenFundingListSkeleton rows={LIST_SIZE} />
          <OpenFundingListSkeleton rows={LIST_SIZE} />
        </>
      ) : (
        <>
          <OpenFundingList title="Open RFPs" href="/fund" entries={rfps} />
          <OpenFundingList title="Open proposals" href="/fund/proposals" entries={proposals} />
        </>
      )}
    </div>
  );
}
