'use client';

import { ActivityCard, ActivityFeedList } from '@/components/Activity';
import type { MyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';
import { MyFundingDataError } from './MyFundingDataError';
import { MyFundingActivityEmptyState } from './MyFundingActivityEmptyState';

interface MyFundingActivityContentProps {
  readonly activity: MyFundingActivity;
}

/** The full activity view shown by the Activity tab. */
export function MyFundingActivityContent({ activity }: MyFundingActivityContentProps) {
  return (
    <div className="mx-auto max-w-3xl">
      {activity.error && (
        <div className="mb-4">
          <MyFundingDataError message="Activity data failed to load. Please refresh and try again." />
        </div>
      )}
      <ActivityFeedList
        isLoading={activity.isLoading}
        isLoadingMore={activity.isLoadingMore}
        hasMore={activity.hasMore}
        loadMore={activity.loadMore}
        isEmpty={activity.entries.length === 0}
        emptyState={<MyFundingActivityEmptyState />}
      >
        {activity.entries.map((entry) => (
          <ActivityCard key={entry.id} entry={entry} />
        ))}
      </ActivityFeedList>
    </div>
  );
}
