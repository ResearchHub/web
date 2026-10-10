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
  /** The author profile of the page's user, whose own updates and reviews join the feed. */
  readonly authorId?: number;
}

export interface MyFundingActivity {
  /** Every source as one stream, the newest first. */
  readonly entries: FeedEntry[];
  /** No source has finished its first load yet. */
  readonly isLoading: boolean;
  /** A later page is loading after the initial stream is visible. */
  readonly isLoadingMore: boolean;
  readonly error: Error | null;
  readonly hasMore: boolean;
  readonly loadMore: () => void;
}

interface PagedSource {
  readonly entries: readonly FeedEntry[];
  readonly hasMore: boolean;
}

/**
 * The oldest moment the merged stream can show without leaving a gap: a feed
 * with more pages may still hold entries newer than another feed's oldest
 * loaded one, so the stream stops at the latest of those edges and the rest
 * waits for the next page.
 */
function streamEdge(sources: readonly PagedSource[]): number {
  let edge = -Infinity;
  for (const source of sources) {
    if (!source.hasMore || source.entries.length === 0) continue;
    const oldest = Math.min(...source.entries.map((entry) => new Date(entry.timestamp).getTime()));
    edge = Math.max(edge, oldest);
  }
  return edge;
}

/**
 * The activity around a user's funding, read as one stream: updates and peer
 * reviews on the work they fund, and their own updates and reviews.
 */
export function useMyFundingActivity({
  viewedUserId,
  authorId,
}: UseMyFundingActivityOptions): MyFundingActivity {
  const followsOwn = authorId != null && authorId > 0;
  const comments = useFunderActivity(viewedUserId);
  const own = useActivityFeed({
    authorId: followsOwn ? authorId : undefined,
    commentTypes: OWN_ACTIVITY_TYPES,
    enabled: followsOwn,
  });
  const sourceKey = `${viewedUserId ?? 'none'}:${authorId ?? 'none'}`;

  // Every feed is waited for, so the rows are not reshuffled when a later one
  // lands. A feed that is switched off never leaves its loading state, so it
  // is not counted; later loads (another page) leave the stream on screen.
  const loadingFirst = comments.isLoading || (followsOwn && own.isLoading);
  const [isSettled, setIsSettled] = useState(false);
  const [settledSourceKey, setSettledSourceKey] = useState<string | null>(null);
  useEffect(() => {
    setIsSettled(false);
    setSettledSourceKey(sourceKey);
  }, [sourceKey]);
  useEffect(() => {
    if (!loadingFirst && settledSourceKey === sourceKey) setIsSettled(true);
  }, [loadingFirst, settledSourceKey, sourceKey]);

  const ownHasMore = followsOwn && own.hasMore;

  const entries = useMemo(() => {
    const ownEntries = followsOwn ? own.entries : [];
    // An entry can sit in more than one feed, when the user reviews work they also fund.
    const byId = new Map<string, FeedEntry>();
    for (const entry of [...comments.entries, ...ownEntries]) {
      byId.set(entry.id, entry);
    }
    const edge = streamEdge([
      { entries: comments.entries, hasMore: comments.hasMore },
      { entries: ownEntries, hasMore: ownHasMore },
    ]);
    return Array.from(byId.values())
      .filter((entry) => new Date(entry.timestamp).getTime() >= edge)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [comments.entries, comments.hasMore, own.entries, ownHasMore, followsOwn]);

  const isCurrentSourceSettled = isSettled && settledSourceKey === sourceKey;
  const isLoadingMore = isCurrentSourceSettled && (comments.isLoading || own.isLoadingMore);
  const loadMore = useCallback(() => {
    if (comments.hasMore) comments.loadMore();
    if (ownHasMore) void own.loadMore();
  }, [comments.hasMore, comments.loadMore, own.loadMore, ownHasMore]);

  return {
    entries,
    // Keep the loading state while a new viewed funder or author feed is
    // starting, even after the first dashboard load settled.
    isLoading: !isCurrentSourceSettled || loadingFirst,
    isLoadingMore,
    error: isCurrentSourceSettled ? (comments.error ?? own.error) : null,
    hasMore: comments.hasMore || ownHasMore,
    loadMore,
  };
}
