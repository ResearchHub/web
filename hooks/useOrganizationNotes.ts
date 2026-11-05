'use client';

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import { NoteService } from '@/services/note.service';
import type { Note } from '@/types/note';

export interface OrganizationNotes {
  readonly notes: Note[];
  /** For a host that patches a row in place, e.g. a title just saved. */
  readonly setNotes: Dispatch<SetStateAction<Note[]>>;
  readonly isLoading: boolean;
  readonly isLoadingMore: boolean;
  readonly error: Error | null;
  readonly totalCount: number;
  readonly hasMore: boolean;
  readonly refresh: () => Promise<void>;
  readonly loadMore: () => void;
}

interface UseOrganizationNotesOptions {
  /**
   * The organization is still being resolved: report loading and fetch
   * nothing yet, rather than showing an empty list that is about to fill.
   */
  readonly waiting?: boolean;
}

const mergeNotesById = (notes: Note[], otherNotes: Note[]): Note[] =>
  Array.from(new Map([...notes, ...otherNotes].map((note) => [note.id, note])).values());

/**
 * The notes of an organization, as the notebook lists them: every note the
 * user can see, with the Registered Reports the plain listing leaves out
 * fetched alongside and merged in. Both streams page independently, so
 * loading more advances whichever still has pages.
 */
export function useOrganizationNotes(
  orgSlug: string | null | undefined,
  { waiting = false }: UseOrganizationNotesOptions = {}
): OrganizationNotes {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrls, setNextPageUrls] = useState<string[]>([]);

  const fetchNotes = useCallback(async (slug: string) => {
    setIsLoading(true);
    setIsLoadingMore(false);
    setError(null);
    setNextPageUrls([]);

    try {
      const [organizationNotes, registeredReports] = await Promise.all([
        NoteService.getOrganizationNotes(slug),
        NoteService.getOrganizationNotes(slug, { documentType: 'REGISTERED_REPORT' }),
      ]);
      const mergedNotes = mergeNotesById(organizationNotes.results, registeredReports.results);

      setNotes(mergedNotes);
      setTotalCount(Math.max(organizationNotes.count, mergedNotes.length));
      setNextPageUrls(
        [organizationNotes.next, registeredReports.next].filter((url) => url !== null)
      );
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notes'));
      setNotes([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    if (!orgSlug) {
      setError(new Error('No organization slug provided'));
      return;
    }
    await fetchNotes(orgSlug);
  }, [orgSlug, fetchNotes]);

  const loadMore = useCallback(() => {
    if (isLoadingMore || nextPageUrls.length === 0) return;
    setError(null);
    setIsLoadingMore(true);
  }, [isLoadingMore, nextPageUrls.length]);

  useEffect(() => {
    if (!orgSlug || !isLoadingMore || nextPageUrls.length === 0) return;

    let cancelled = false;

    const fetchNextNotes = async () => {
      try {
        const nextPages = await Promise.all(
          nextPageUrls.map((nextUrl) => NoteService.getOrganizationNotes(orgSlug, { nextUrl }))
        );
        if (cancelled) return;

        const newNotes = nextPages.flatMap((page) => page.results);
        setNotes((currentNotes) => mergeNotesById(currentNotes, newNotes));
        setNextPageUrls(nextPages.flatMap(({ next }) => (next ? [next] : [])));
      } catch (err) {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error('Failed to load more notes'));
      } finally {
        if (!cancelled) setIsLoadingMore(false);
      }
    };

    void fetchNextNotes();
    return () => {
      cancelled = true;
    };
  }, [isLoadingMore, nextPageUrls, orgSlug]);

  // Load when the organization is known; clear when there is none.
  useEffect(() => {
    if (waiting) return;
    if (!orgSlug) {
      setNotes([]);
      setTotalCount(0);
      setIsLoadingMore(false);
      setNextPageUrls([]);
      setError(null);
      setIsLoading(false);
      return;
    }
    void fetchNotes(orgSlug);
  }, [orgSlug, waiting, fetchNotes]);

  return {
    notes,
    setNotes,
    isLoading: waiting || isLoading,
    isLoadingMore,
    error,
    totalCount,
    hasMore: nextPageUrls.length > 0,
    refresh,
    loadMore,
  };
}
