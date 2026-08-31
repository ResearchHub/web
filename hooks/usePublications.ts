'use client';

import { useState, useEffect } from 'react';
import { PublicationService, AuthorPublicationsResponse } from '@/services/publication.service';
import { ID } from '@/types/root';
import { useFeedStateRestoration } from './useFeedStateRestoration';
import { FeedEntry } from '@/types/feed';

interface UseAuthorPublicationsOptions {
  authorId: ID;
  initialData?: AuthorPublicationsResponse;
  activeTab?: string; // Add activeTab for feed key generation
}

export function useAuthorPublications(options: UseAuthorPublicationsOptions) {
  const { restoredState, initialEntries, restoredScrollPosition, lastClickedEntryId } =
    useFeedStateRestoration({
      activeTab: options.activeTab,
    });

  const initialHasRestoredEntries = restoredState !== null;

  const [publications, setPublications] = useState<any[]>(options.initialData?.results || []);
  const [isLoading, setIsLoading] = useState(!initialHasRestoredEntries && !options.initialData);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AuthorPublicationsResponse | null>(
    options.initialData || null
  );
  const [error, setError] = useState<Error | null>(null);

  const [restoredFeedEntries, setRestoredFeedEntries] = useState<FeedEntry[]>(initialEntries);
  const [hasRestoredEntries, setHasRestoredEntries] = useState<boolean>(initialHasRestoredEntries);

  const loadPublications = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await PublicationService.getAuthorPublications({
        authorId: options.authorId,
      });

      setPublications(response.results);
      setCurrentResponse(response);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load publications'));
      console.error('Error loading publications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialHasRestoredEntries && initialEntries.length > 0 && !hasRestoredEntries) {
      setHasRestoredEntries(true);
      setRestoredFeedEntries(initialEntries);
    }
  }, [initialHasRestoredEntries, initialEntries.length, hasRestoredEntries]);

  useEffect(() => {
    if (hasRestoredEntries && restoredFeedEntries.length > 0) {
      return;
    }

    if (options.initialData) {
      return;
    }

    loadPublications();
  }, [options.authorId, options.initialData]);

  const loadMore = async () => {
    if (!currentResponse?.next || isLoading || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);
    setError(null);

    try {
      const nextPage = await PublicationService.loadMoreAuthorPublications(currentResponse);

      setPublications((prev) => [...prev, ...nextPage.results]);
      setCurrentResponse(nextPage);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load more publications'));
      console.error('Error loading more publications:', err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  return {
    publications,
    isLoading,
    error,
    hasMore: !!currentResponse?.next,
    loadMore,
    refresh: loadPublications,
    isLoadingMore,
    restoredFeedEntries: hasRestoredEntries ? restoredFeedEntries : undefined,
    restoredScrollPosition,
    lastClickedEntryId,
  };
}
