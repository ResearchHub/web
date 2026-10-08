'use client';

import { MyFundingActivityFeed } from '@/components/Funding/dashboard/MyFundingActivityFeed';
import type { MyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';
import { MyFundingActivityEmptyState } from './MyFundingActivityEmptyState';
import { MyFundingDataError } from './MyFundingDataError';

interface MyFundingActivityContentProps {
  readonly activity: MyFundingActivity;
  /** When the user last looked; later news is marked new. */
  readonly seenAt: number | null;
  /** A scientist the user backs, named in the empty state. */
  readonly firstScientist?: string;
  readonly hasRfps: boolean;
}

/** The Activity tab. */
export function MyFundingActivityContent({
  activity,
  seenAt,
  firstScientist,
  hasRfps,
}: MyFundingActivityContentProps) {
  return (
    <div className="max-w-3xl">
      {activity.error && (
        <div className="mb-4">
          <MyFundingDataError message="Activity data failed to load. Please refresh and try again." />
        </div>
      )}
      <MyFundingActivityFeed
        activity={activity}
        seenAt={seenAt}
        emptyState={
          <MyFundingActivityEmptyState firstScientist={firstScientist} hasRfps={hasRfps} />
        }
      />
    </div>
  );
}
