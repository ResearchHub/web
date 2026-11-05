'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-hot-toast';
import { FeedModerationService } from '@/services/feed-moderation.service';
import { extractApiErrorMessage } from '@/services/lib/serviceUtils';
import { ID } from '@/types/root';
import type { FeedEntry } from '@/types/feed';

const SEARCH_DEBOUNCE_MS = 300;

interface UseExcludedFromFeedReturn {
  items: FeedEntry[];
  isLoading: boolean;
  isLoadingMore: boolean;
  isRestoring: boolean;
  error: Error | null;
  hasMore: boolean;
  query: string;
  setQuery: (query: string) => void;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  restore: (feedEntryId: ID) => Promise<boolean>;
}

export function useExcludedFromFeed(): UseExcludedFromFeedReturn {
  const [items, setItems] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const requestIdRef = useRef(0);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  const fetchPage = useCallback(
    async (pageUrl?: string, append = false, { keepItems = false } = {}) => {
      const requestId = ++requestIdRef.current;
      if (append) {
        setIsLoadingMore(true);
      } else {
        setNextUrl(null);
        if (!keepItems) {
          setIsLoading(true);
          setItems([]);
        }
      }
      setError(null);

      try {
        const response = await FeedModerationService.listExcludedFromFeed(
          pageUrl ? { pageUrl } : { page: 1, query: debouncedQuery || undefined }
        );
        if (requestId !== requestIdRef.current) {
          return;
        }
        setItems((prev) => (append ? [...prev, ...response.results] : response.results));
        setNextUrl(response.next);
      } catch (err) {
        if (requestId !== requestIdRef.current) {
          return;
        }
        const nextError =
          err instanceof Error ? err : new Error('Failed to load hidden feed entries');
        setError(nextError);
        // Prevent infinite-scroll from retrying the same failing page URL.
        setNextUrl(null);
        if (!append && !keepItems) {
          setItems([]);
        }
      } finally {
        if (requestId === requestIdRef.current) {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      }
    },
    [debouncedQuery]
  );

  useEffect(() => {
    void fetchPage();
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (!nextUrl || isLoading || isLoadingMore) {
      return;
    }
    await fetchPage(nextUrl, true);
  }, [fetchPage, isLoading, isLoadingMore, nextUrl]);

  const refresh = useCallback(async () => {
    await fetchPage();
  }, [fetchPage]);

  const restore = useCallback(
    async (feedEntryId: ID): Promise<boolean> => {
      if (feedEntryId == null || feedEntryId === '') {
        return false;
      }

      setIsRestoring(true);
      try {
        await FeedModerationService.includeInFeed(feedEntryId);
        // Refetch page 1 so nextUrl tracks the shifted server-side pages.
        setItems((prev) => prev.filter((item) => item.id !== String(feedEntryId)));
        toast.success('Restored to feeds.');
        await fetchPage(undefined, false, { keepItems: true });
        return true;
      } catch (err) {
        toast.error(extractApiErrorMessage(err, 'Failed to restore to feed'));
        return false;
      } finally {
        setIsRestoring(false);
      }
    },
    [fetchPage]
  );

  return {
    items,
    isLoading,
    isLoadingMore,
    isRestoring,
    error,
    hasMore: !!nextUrl,
    query,
    setQuery,
    loadMore,
    refresh,
    restore,
  };
}
