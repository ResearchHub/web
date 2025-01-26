import { useState, useEffect } from 'react';
import { NoteService } from '@/services/note.service';
import type { Note } from '@/types/note';
import type { Organization } from '@/types/organization';

/**
 * Return type for the useOrganizationNotes hook
 */
export interface UseOrganizationNotesReturn {
  /** All notes for the organization */
  notes: Note[];
  /** Notes with access type 'WORKSPACE' or 'SHARED' */
  workspaceNotes: Note[];
  /** Notes with access type 'PRIVATE' */
  privateNotes: Note[];
  /** Whether notes are currently being fetched */
  isLoading: boolean;
  /** Error object if the fetch failed, null otherwise */
  error: Error | null;
  /** Total count of notes from the API response */
  totalCount: number;
}

/**
 * Custom hook to fetch and manage organization notes
 *
 * This hook handles fetching notes for a given organization and provides filtered lists
 * based on note access types. Notes can have one of three access types:
 * - WORKSPACE: Visible to all organization members
 * - PRIVATE: Only visible to the note creator
 * - SHARED: Visible to specific organization members (grouped with WORKSPACE notes in UI)
 *
 * @param organization - The organization to fetch notes for. If null, notes will be cleared
 * @returns UseOrganizationNotesReturn object containing notes and loading state
 *
 * @example
 * ```tsx
 * const { workspaceNotes, privateNotes, isLoading, error } = useOrganizationNotes(selectedOrg);
 *
 * if (isLoading) return <LoadingSpinner />;
 * if (error) return <ErrorMessage error={error} />;
 *
 * return (
 *   <div>
 *     <WorkspaceNotesList notes={workspaceNotes} />
 *     <PrivateNotesList notes={privateNotes} />
 *   </div>
 * );
 * ```
 */
export function useOrganizationNotes(
  organization: Organization | null
): UseOrganizationNotesReturn {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    const fetchNotes = async () => {
      if (!organization) {
        setNotes([]);
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching notes for organization:', organization);
        setError(null);
        setIsLoading(true);
        const response = await NoteService.getOrganizationNotes(organization.slug);
        console.log('Notes response:', response);
        setNotes(response.results);
        setTotalCount(response.count);
      } catch (err) {
        console.error('Error in useOrganizationNotes:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch notes'));
        // Clear notes when there's an error
        setNotes([]);
        setTotalCount(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchNotes();
  }, [organization]);

  // Filter notes by access type
  // Include both WORKSPACE and SHARED notes in the workspace section
  const workspaceNotes = notes.filter(
    (note) => note.access === 'WORKSPACE' || note.access === 'SHARED'
  );
  const privateNotes = notes.filter((note) => note.access === 'PRIVATE');

  console.log('Current notes state:', {
    all: notes,
    workspace: workspaceNotes,
    private: privateNotes,
    isLoading,
    error,
  });

  return {
    notes,
    workspaceNotes,
    privateNotes,
    isLoading,
    error,
    totalCount,
  };
}
