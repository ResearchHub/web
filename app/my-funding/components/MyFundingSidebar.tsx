'use client';

import { useMemo } from 'react';
import { ActivitySidebar, ActivitySidebarSkeleton } from '@/components/Activity';
import { useFunderActivity } from '@/components/Funding/dashboard/hooks/useFunderActivity';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityCommentType } from '@/services/activity.service';

/** How many rows the rail shows; the RFP page's rail shows the same. */
const SIDEBAR_ROWS = 15;

/**
 * The activity rail of Funds given: what the funder's applicants and
 * reviewers have been up to — the same rail an RFP page has, fed by the
 * funder's activity instead of the RFP's.
 */
export function FundsGivenActivity({ viewedUserId }: Readonly<{ viewedUserId: number }>) {
  const { entries, isLoading } = useFunderActivity(viewedUserId);
  const recent = useMemo(() => entries.slice(0, SIDEBAR_ROWS), [entries]);
  if (isLoading && entries.length === 0) return <ActivitySidebarSkeleton />;
  return <ActivitySidebar entries={recent} />;
}

/** Stable reference: a new array on every render would restart the activity feed. */
const RECEIVED_ACTIVITY_TYPES: readonly ActivityCommentType[] = [
  'AUTHOR_UPDATE',
  'REVIEW',
  'PEER_REVIEW',
];

/** The activity rail of Funds received: the researcher's own recent activity. */
export function FundsReceivedActivity({ authorId }: Readonly<{ authorId?: number }>) {
  const { entries, isLoading } = useActivityFeed({
    authorId,
    commentTypes: RECEIVED_ACTIVITY_TYPES,
    enabled: authorId != null,
  });
  const recent = useMemo(() => entries.slice(0, SIDEBAR_ROWS), [entries]);
  if (authorId != null && isLoading && entries.length === 0) return <ActivitySidebarSkeleton />;
  return <ActivitySidebar entries={recent} />;
}
