import { useState, useEffect } from 'react';
import { NoteService, NoteError } from '@/services/note.service';
import type { NoteWithContent, Note, NoteAccess, NoteContent } from '@/types/note';
import { ID } from '@/types/root';

export interface UseNoteReturn {
  note: NoteWithContent | null;
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
export function useNote(noteId: string): UseNoteReturn {
  const [note, setNote] = useState<NoteWithContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function fetchNote() {
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

interface CreateNoteInput {
  title: string;
  grouping: NoteAccess;
  organizationSlug: string;
}

interface UseCreateNoteState {
  note: Note | null;
  isLoading: boolean;
  error: Error | null;
}

type CreateNoteFn = (params: CreateNoteInput) => Promise<Note>;
type UseCreateNoteReturn = [UseCreateNoteState, CreateNoteFn];

export const useCreateNote = (): UseCreateNoteReturn => {
  const [note, setNote] = useState<Note | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const createNote = async (params: CreateNoteInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await NoteService.createNote({
        title: params.title,
        grouping: params.grouping,
        organization_slug: params.organizationSlug,
      });
      setNote(response);
      return response;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to create note';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ note, isLoading, error }, createNote];
};

interface UseNoteContentState {
  note: NoteContent | null;
  isLoading: boolean;
  error: Error | null;
}

interface UpdateNoteContentInput {
  note: ID;
  fullSrc?: string;
  plainText?: string;
  fullJson?: string;
}

type UpdateNoteContentFn = (params: UpdateNoteContentInput) => Promise<NoteContent>;
type UseNoteContentReturn = [UseNoteContentState, UpdateNoteContentFn];

export const useNoteContent = (): UseNoteContentReturn => {
  const [note, setNote] = useState<NoteContent | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const updateNoteContent = async (params: UpdateNoteContentInput) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await NoteService.updateNoteContent({
        note: params.note,
        full_src: params.fullSrc,
        plain_text: params.plainText,
        full_json: params.fullJson,
      });
      setNote(response);
      return response;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to update note content';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ note, isLoading, error }, updateNoteContent];
};

interface UseDeleteNoteState {
  isLoading: boolean;
  error: Error | null;
}

type DeleteNoteFn = (noteId: ID) => Promise<Note>;
type UseDeleteNoteReturn = [UseDeleteNoteState, DeleteNoteFn];

export const useDeleteNote = (): UseDeleteNoteReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteNote = async (noteId: ID) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await NoteService.deleteNote(noteId);
      return response;
    } catch (err) {
      const errorMsg = err instanceof NoteError ? err.message : 'Failed to delete note';
      const error = new Error(errorMsg);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return [{ isLoading, error }, deleteNote];
};
