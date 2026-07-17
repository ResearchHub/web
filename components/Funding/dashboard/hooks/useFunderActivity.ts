'use client';

import { useCallback, useEffect, useState } from 'react';
import { FunderService } from '@/services/funder.service';
import type { FeedEntry } from '@/types/feed';

const PAGE_SIZE = 20;

interface UseFunderActivityResult {
  entries: FeedEntry[];
  isLoading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}

/**
 * Paginated funder activity feed (peer reviews + author updates) for the
 * given funder. Resets when funderId changes; loadMore() pulls the next page.
 */
export function useFunderActivity(funderId: number | undefined): UseFunderActivityResult {
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset when funderId changes
  useEffect(() => {
    setEntries([]);
    setHasMore(false);
    setPage(1);
  }, [funderId]);

  useEffect(() => {
    if (!funderId) return;
    let cancelled = false;
    const requestPage = page;
    setIsLoading(true);

    FunderService.getActivity(funderId, {
      contentType: 'RHCOMMENTMODEL',
      pageSize: PAGE_SIZE,
      page: requestPage,
    })
      .then((res) => {
        if (cancelled) return;
        setEntries((prev) => (requestPage === 1 ? res.entries : [...prev, ...res.entries]));
        setHasMore(res.hasMore);
      })
      .catch(() => {
        if (!cancelled) setHasMore(false);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [funderId, page]);

  const loadMore = useCallback(() => {
    if (!isLoading && hasMore) setPage((p) => p + 1);
  }, [isLoading, hasMore]);

  return { entries, isLoading, hasMore, loadMore };
}
