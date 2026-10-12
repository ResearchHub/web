'use client';

import { useMemo } from 'react';
import { Activity } from 'lucide-react';
import { ActivityCardSkeleton, ActivityRow } from '@/components/Activity';
import { groupActivityRows } from '@/components/Activity/lib/activityGrouping.utils';
import { DashboardSection, SeeAllButton } from '@/components/Funding/dashboard/DashboardSection';
import type { MyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';

/**
 * What the activity will hold, naming a scientist the user backs when there
 * is one. The activity reads updates and peer reviews, not money moving.
 */
export function activityPromise(firstScientist?: string): string {
  return firstScientist
    ? `When ${firstScientist} posts an update or the work gets a peer review, it shows up here.`
    : 'Updates and peer reviews on the work you are part of show up here.';
}

/** How much of the activity the Overview shows. */
const PREVIEW_ROWS = 3;

interface RecentActivityPreviewProps {
  readonly activity: MyFundingActivity;
  /** A scientist the user backs, named in the empty state. */
  readonly firstScientist?: string;
  /** Opens the Activity tab. */
  readonly onSeeAll: () => void;
}

/**
 * The latest few things to happen around the user's funding, at the foot of
 * the Overview; with nothing yet, what will appear here.
 */
export function RecentActivityPreview({
  activity,
  firstScientist,
  onSeeAll,
}: RecentActivityPreviewProps) {
  const rows = useMemo(
    () => groupActivityRows(activity.entries).slice(0, PREVIEW_ROWS),
    [activity.entries]
  );

  if (!activity.isLoading && rows.length === 0) {
    return (
      <DashboardSection title="Recent activity">
        <div className="flex items-center gap-3.5 rounded-xl border border-gray-200 bg-white px-4 py-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-50">
            <Activity className="h-5 w-5 text-primary-500" aria-hidden="true" />
          </span>
          <span className="min-w-0">
            <span className="block text-[15px] font-semibold text-gray-900">Nothing new yet</span>
            <span className="block text-sm text-gray-500">{activityPromise(firstScientist)}</span>
          </span>
        </div>
      </DashboardSection>
    );
  }

  const seeAll = <SeeAllButton onClick={onSeeAll}>See all activity</SeeAllButton>;

  return (
    <DashboardSection title="Recent activity" action={seeAll}>
      {activity.isLoading ? (
        <ActivityCardSkeleton />
      ) : (
        rows.map((row) => <ActivityRow key={row.key} row={row} />)
      )}
    </DashboardSection>
  );
}
