'use client';

import { useState, useEffect } from 'react';
import { useFeedStateRestoration } from './useFeedStateRestoration';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import { RHJournalService } from '@/services/rh-journal.service';

interface UseJournalFeedOptions {
  activeTab: string;
}

export function useJournalFeed(options: UseJournalFeedOptions) {
  const { restoredState, initialEntries, restoredScrollPosition, lastClickedEntryId } =
    useFeedStateRestoration({
      activeTab: options.activeTab,
    });

  const initialHasRestoredEntries = restoredState !== null;
  const initialPage = restoredState?.page ?? 1;

  // Map active tab to API filter value
  const getPublicationStatus = () => {
    switch (options.activeTab) {
      case 'in-review':
        return 'PREPRINT' as const;
      case 'published':
        return 'PUBLISHED' as const;
      default:
        return 'ALL' as const;
    }
  };

  const [feedEntries, setFeedEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!initialHasRestoredEntries);
  const [hasMore, setHasMore] = useState(restoredState?.hasMore ?? false);
  const [page, setPage] = useState(initialPage);
  const [error, setError] = useState<Error | null>(null);

  const [restoredFeedEntries, setRestoredFeedEntries] = useState<FeedEntry[]>(initialEntries);
  const [hasRestoredEntries, setHasRestoredEntries] = useState<boolean>(initialHasRestoredEntries);

  const loadJournalPapers = async () => {
    setIsLoading(true);
    setError(null);
    setFeedEntries([]);

    try {
      const publicationStatus = getPublicationStatus();
      const response = await RHJournalService.getJournalPapers({
        page: 1,
        pageSize: 10,
        publicationStatus,
        journalStatus: 'IN_JOURNAL',
      });

      // Transform API response to FeedEntry objects
      const entries = response.results
        .map((entry: RawApiFeedEntry) => {
          try {
            return transformFeedEntry(entry);
          } catch (error) {
            console.error('Error transforming feed entry:', error);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => !!entry);

      setFeedEntries(entries);
      setHasMore(!!response.next);
      setPage(1);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch journal papers'));
      console.error('Failed to fetch journal papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialHasRestoredEntries && initialEntries.length > 0 && !hasRestoredEntries) {
      setHasRestoredEntries(true);
      setRestoredFeedEntries(initialEntries);
      setFeedEntries(initialEntries);
    }
  }, [initialHasRestoredEntries, initialEntries.length, hasRestoredEntries, initialEntries]);

  useEffect(() => {
    // Reset restored entries state when tab changes
    if (!initialHasRestoredEntries) {
      setRestoredFeedEntries([]);
      setHasRestoredEntries(false);
    }
  }, [options.activeTab, initialHasRestoredEntries]);

  useEffect(() => {
    if (hasRestoredEntries && restoredFeedEntries.length > 0) {
      return;
    }

    loadJournalPapers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options.activeTab]);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const publicationStatus = getPublicationStatus();
      const nextPage = page + 1;
      const response = await RHJournalService.getJournalPapers({
        page: nextPage,
        pageSize: 10,
        publicationStatus,
        journalStatus: 'IN_JOURNAL',
      });

      // Transform and append new entries
      const newEntries = response.results
        .map((entry: RawApiFeedEntry) => {
          try {
            return transformFeedEntry(entry);
          } catch (error) {
            console.error('Error transforming feed entry:', error);
            return null;
          }
        })
        .filter((entry): entry is FeedEntry => !!entry);

      setFeedEntries((prev) => [...prev, ...newEntries]);
      setHasMore(!!response.next);
      setPage(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more journal papers'));
      console.error('Failed to load more journal papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entries: hasRestoredEntries ? restoredFeedEntries : feedEntries,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh: loadJournalPapers,
    page,
    restoredScrollPosition,
    lastClickedEntryId,
  };
}
