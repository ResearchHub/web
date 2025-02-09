import { useEffect, useState } from 'react';
import { NoteService } from '@/services/note.service';
import type { Note } from '@/types/note';
import type { Organization } from '@/types/organization';

/**
 * Return type for the useOrganizationNotes hook
 */
export interface UseOrganizationNotesReturn {
  /** All notes for the organization */
  notes: Note[];
  /** Whether notes are currently being fetched */
  isLoading: boolean;
  /** Error object if the fetch failed, null otherwise */
  error: Error | null;
  /** Total count of notes from the API response */
  totalCount: number;
}

export interface UseOrganizationNotesOptions {
  currentOrgSlug?: string;
}

/**
 * Custom hook to fetch notes for a given organization.
 * Only fetches notes when the organization matches the current route.
 * This prevents unnecessary API calls when:
 * - The app first loads with multiple organizations
 * - The user hasn't selected an organization yet
 * - We're fetching notes for an organization that isn't currently viewed
 */
export function useOrganizationNotes(
  organization: Organization | null,
  options?: UseOrganizationNotesOptions
): UseOrganizationNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    // Reset state when org is null or doesn't match current route
    if (!organization || organization.slug !== options?.currentOrgSlug) {
      setNotes([]);
      setTotalCount(0);
      setError(null);
      setIsLoading(false);
      return;
    }

    const fetchNotes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await NoteService.getOrganizationNotes(organization.slug);
        setNotes(data.results);
        setTotalCount(data.count);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to load notes'));
        setNotes([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [organization?.slug, options?.currentOrgSlug]);

  return { notes, isLoading, error, totalCount };
}
