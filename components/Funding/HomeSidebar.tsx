'use client';

import { RecentlyVisited } from '@/components/RecentlyVisited/RecentlyVisited';
import { OpenFundingList, OpenFundingListSkeleton } from '@/components/Funding/OpenFundingList';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { useOpenFunding } from '@/hooks/useOpenFunding';

/** Rows per section, so all three fit the column on a laptop screen. */
const LIST_SIZE = 3;

/** Where RightSidebarContainer starts showing the column (Tailwind's `lg`). */
const SIDEBAR_VISIBLE_QUERY = '(min-width: 1024px)';

/**
 * The home tabs' right sidebar: the viewer's recently visited pages when they
 * have any, then open RFPs and open proposals, so a new visitor never meets an
 * empty column. Below the width where the column shows, nothing is fetched.
 */
export function HomeSidebar() {
  const isVisible = useMediaQuery(SIDEBAR_VISIBLE_QUERY) === true;
  const { rfps, proposals, isLoading } = useOpenFunding(LIST_SIZE, { enabled: isVisible });

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
