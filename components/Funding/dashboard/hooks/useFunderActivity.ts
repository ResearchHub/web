'use client';

import { useCallback, useEffect, useState } from 'react';
import { FunderService } from '@/services/funder.service';
import type { FeedEntry } from '@/types/feed';

const PAGE_SIZE = 20;
const RENDERABLE_COMMENT_TYPES = ['AUTHOR_UPDATE', 'REVIEW', 'PEER_REVIEW'] as const;

interface UseFunderActivityResult {
  entries: FeedEntry[];
  totalCount: number;
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
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Reset when funderId changes
  useEffect(() => {
    setEntries([]);
    setTotalCount(0);
    setHasMore(false);
    setPage(1);
  }, [funderId]);

  useEffect(() => {
    if (!funderId) return;
    let cancelled = false;
    const requestPage = page;
    setIsLoading(true);

    FunderService.getActivity(funderId, {
      commentTypes: RENDERABLE_COMMENT_TYPES,
      pageSize: PAGE_SIZE,
      page: requestPage,
    })
      .then((res) => {
        if (cancelled) return;
        setEntries((prev) => (requestPage === 1 ? res.entries : [...prev, ...res.entries]));
        if (requestPage === 1) setTotalCount(res.count);
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
    if (!isLoading && hasMore) setPage((currentPage) => currentPage + 1);
  }, [hasMore, isLoading]);

  return { entries, totalCount, isLoading, hasMore, loadMore };
}
