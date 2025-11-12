'use client';

import { useState, useEffect } from 'react';
import { useFeedStateRestoration } from './useFeedStateRestoration';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';
import { RHJournalService } from '@/services/rh-journal.service';

export function useJournalFeed(activeTab: string) {
  const { restoredState, restoredScrollPosition, lastClickedEntryId } = useFeedStateRestoration({
    activeTab: activeTab,
  });

  const initialEntries = restoredState?.entries || [];
  const initialHasMore = restoredState?.hasMore ?? false;
  const initialPage = restoredState?.page ?? 1;
  const hasRestoredEntries = restoredState !== null;
  // Map active tab to API filter value
  const getPublicationStatus = () => {
    switch (activeTab) {
      case 'in-review':
        return 'PREPRINT' as const;
      case 'published':
        return 'PUBLISHED' as const;
      default:
        return 'ALL' as const;
    }
  };

  const [entries, setEntries] = useState<FeedEntry[]>(initialEntries);
  const [isLoading, setIsLoading] = useState(!hasRestoredEntries);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [page, setPage] = useState(initialPage);

  const loadJournalPapers = async () => {
    setIsLoading(true);
    setEntries([]);

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

      setEntries(entries);
      setHasMore(!!response.next);
      setPage(1);
    } catch (err) {
      console.error('Failed to fetch journal papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (hasRestoredEntries && entries.length > 0) {
      return;
    }

    loadJournalPapers();
  }, [activeTab]);

  const loadMore = async () => {
    if (!hasMore || isLoading) return;

    setIsLoading(true);

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

      setEntries((prev) => [...prev, ...newEntries]);
      setHasMore(!!response.next);
      setPage(nextPage);
    } catch (err) {
      console.error('Failed to load more journal papers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    entries,
    isLoading,
    hasMore,
    loadMore,
    refresh: loadJournalPapers,
    page,
    restoredScrollPosition,
    lastClickedEntryId,
  };
}
