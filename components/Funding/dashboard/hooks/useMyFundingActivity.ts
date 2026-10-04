'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useFunderActivity } from '@/components/Funding/dashboard/hooks/useFunderActivity';
import { useActivityFeed } from '@/hooks/useActivityFeed';
import type { ActivityCommentType } from '@/services/activity.service';
import type { FeedEntry } from '@/types/feed';

/** Stable reference: a new array on every render would restart the activity feed. */
const OWN_ACTIVITY_TYPES: readonly ActivityCommentType[] = [
  'AUTHOR_UPDATE',
  'REVIEW',
  'PEER_REVIEW',
];

interface UseMyFundingActivityOptions {
  /** Whose funding is followed: the user, or the funder a moderator is viewing. */
  readonly viewedUserId: number | undefined;
  /** The user's own author profile; left out on a moderator's view of another funder. */
  readonly authorId?: number;
}

export interface MyFundingActivity {
  /** Both sides as one stream, the newest first. */
  readonly entries: FeedEntry[];
  /** Neither feed has finished its first load yet. */
  readonly isLoading: boolean;
  /** A later page is loading after the initial stream is visible. */
  readonly isLoadingMore: boolean;
  readonly error: Error | null;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
}

/**
 * The activity around a user's funding, read as one stream: what the
 * applicants and reviewers of the work they fund have been up to, and their
 * own updates and reviews.
 */
export function useMyFundingActivity({
  viewedUserId,
  authorId,
}: UseMyFundingActivityOptions): MyFundingActivity {
  const followsOwn = authorId != null && authorId > 0;
  const funded = useFunderActivity(viewedUserId);
  const own = useActivityFeed({
    authorId: followsOwn ? authorId : undefined,
    commentTypes: OWN_ACTIVITY_TYPES,
    enabled: followsOwn,
  });
  const sourceKey = `${viewedUserId ?? 'none'}:${authorId ?? 'none'}`;

  // Both feeds are waited for, so the rows are not reshuffled when the second
  // one lands. A feed that is switched off never leaves its loading state, so
  // it is not counted; later loads (another page) leave the stream on screen.
  const loadingFirst = funded.isLoading || (followsOwn && own.isLoading);
  const [isSettled, setIsSettled] = useState(false);
  const [settledSourceKey, setSettledSourceKey] = useState<string | null>(null);
  useEffect(() => {
    setIsSettled(false);
    setSettledSourceKey(sourceKey);
  }, [sourceKey]);
  useEffect(() => {
    if (!loadingFirst && settledSourceKey === sourceKey) setIsSettled(true);
  }, [loadingFirst, settledSourceKey, sourceKey]);

  const entries = useMemo(() => {
    // An entry can sit in both feeds, when the user reviews work they also fund.
    const byId = new Map<string, FeedEntry>();
    for (const entry of [...funded.entries, ...(followsOwn ? own.entries : [])]) {
      byId.set(entry.id, entry);
    }
    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [funded.entries, own.entries, followsOwn]);

  const ownHasMore = followsOwn && own.hasMore;
  const isCurrentSourceSettled = isSettled && settledSourceKey === sourceKey;
  const isLoadingMore = isCurrentSourceSettled && (funded.isLoading || own.isLoadingMore);
  const loadMore = useCallback(() => {
    if (funded.hasMore) funded.loadMore();
    if (ownHasMore) void own.loadMore();
  }, [funded.hasMore, funded.loadMore, own.loadMore, ownHasMore]);

  return {
    entries,
    // Keep the sidebar in its loading state while a new viewed funder or
    // author feed is starting, even after the first dashboard load settled.
    isLoading: !isCurrentSourceSettled || loadingFirst,
    isLoadingMore,
    error: isCurrentSourceSettled ? (funded.error ?? own.error) : null,
    hasMore: funded.hasMore || ownHasMore,
    loadMore,
  };
}
