import { useState, useEffect } from 'react';
import { NoteService, NoteError } from '@/services/note.service';
import type { NoteContent, Note } from '@/types/note';

export interface UseNoteReturn {
  note: NoteContent | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Custom hook to fetch and manage note data.
 * Accepts an optional initialNote to prevent unnecessary fetching when data is already available.
 *
 * TODO: Future Collaboration Implementation
 * This hook will be updated to use TipTap's collaboration features:
 * 1. Initialize Y.js document
 * 2. Configure TipTap collaboration extension
 * 3. Set up WebSocket connection via TiptapCollabProvider
 * 4. Handle real-time updates and presence
 *
 * Example future implementation:
 * ```typescript
 * const doc = new Y.Doc();
 * const editor = useEditor({
 *   extensions: [
 *     StarterKit.configure({ history: false }), // Disable for collaboration
 *     Collaboration.configure({ document: doc }),
 *     // Add cursor presence, etc.
 *   ],
 * });
 * ```
 *
 * @param noteId - The ID of the note to fetch
 * @param initialNote - Optional initial note metadata to prevent unnecessary fetching
 * @returns UseNoteReturn object containing note data and loading state
 */
export function useNote(noteId: string | null, initialNote?: Note): UseNoteReturn {
  const [note, setNote] = useState<NoteContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchNote() {
      if (!noteId) {
        setNote(null);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const noteData = await NoteService.getNote(noteId);

        if (!isMounted) return;

        setNote(noteData);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err : new Error('Failed to fetch note'));
        setNote(null);
      } finally {
        if (!isMounted) return;
        setIsLoading(false);
      }
    }

    fetchNote();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [noteId]);

  return {
    note,
    isLoading,
    error,
  };
}
