'use client';

import { Fragment, type ReactNode, useMemo } from 'react';
import { ActivityFeedList, ActivityRow } from '@/components/Activity';
import {
  groupActivityRows,
  type ActivityRow as ActivityRowModel,
} from '@/components/Activity/lib/activityGrouping.utils';
import type { MyFundingActivity } from '@/components/Funding/dashboard/hooks/useMyFundingActivity';
import { cn } from '@/utils/styles';

const rowTime = (row: ActivityRowModel) =>
  new Date(row.kind === 'entry' ? row.entry.timestamp : row.latestEntry.timestamp).getTime();

const NEW_LABEL = 'New since your last visit';

interface MyFundingActivityFeedProps {
  readonly activity: MyFundingActivity;
  /** When the user last looked, from the page load; later news is marked new. */
  readonly seenAt: number | null;
  readonly emptyState: ReactNode;
}

/**
 * The Activity tab: everything around the user's funding in Home's own cards,
 * newest first, with what arrived since the last visit set apart on top.
 */
export function MyFundingActivityFeed({
  activity,
  seenAt,
  emptyState,
}: MyFundingActivityFeedProps) {
  // Headed only when there is something new to set apart from the rest.
  const groups = useMemo(() => {
    const rows = groupActivityRows(activity.entries);
    const fresh = seenAt == null ? [] : rows.filter((row) => rowTime(row) > seenAt);
    if (fresh.length === 0) return rows.length ? [{ label: null, rows }] : [];
    const earlier = rows.filter((row) => !fresh.includes(row));
    return [
      { label: NEW_LABEL, rows: fresh },
      ...(earlier.length ? [{ label: 'Earlier', rows: earlier }] : []),
    ];
  }, [activity.entries, seenAt]);

  const isEmpty = groups.length === 0;

  return (
    <div>
      <ActivityFeedList
        isLoading={activity.isLoading}
        isLoadingMore={activity.isLoadingMore}
        hasMore={activity.hasMore}
        loadMore={activity.loadMore}
        isEmpty={isEmpty}
        emptyState={emptyState}
      >
        {groups.map((group) => (
          <Fragment key={group.label ?? 'all'}>
            {group.label && (
              <h3
                className={cn(
                  'mt-6 flex items-center gap-2.5 text-sm font-semibold first:mt-0 after:h-px after:flex-1 after:bg-gray-200',
                  group.label === NEW_LABEL ? 'text-primary-700' : 'text-gray-700'
                )}
              >
                {group.label === NEW_LABEL && (
                  <span className="h-2 w-2 rounded-full bg-primary-500" aria-hidden="true" />
                )}
                {group.label}
              </h3>
            )}
            {group.rows.map((row) => (
              <ActivityRow key={row.key} row={row} />
            ))}
          </Fragment>
        ))}
      </ActivityFeedList>
    </div>
  );
}
