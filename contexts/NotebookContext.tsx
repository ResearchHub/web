'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from 'react';
import { NoteService } from '@/services/note.service';
import { OrganizationService } from '@/services/organization.service';
import { PublishingHostProvider, type PublishingHost } from '@/contexts/PublishingHostContext';
import type { Note, NoteWithContent } from '@/types/note';
import type { ID } from '@/types/root';
import type { OrganizationUsers } from '@/types/organization';
import { useOrganizationContext } from './OrganizationContext';
import { useNoteDetailsSaver, type NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
import { useOrganizationNotes } from '@/hooks/useOrganizationNotes';
import { Editor } from '@tiptap/core';
import { useParams } from 'next/navigation';

interface NotebookContextType {
  // Notes list state
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  isLoadingNotes: boolean;
  isLoadingMoreNotes: boolean;
  notesError: Error | null;
  totalCount: number;
  hasMoreNotes: boolean;
  refreshNotes: () => Promise<void>;
  loadMoreNotes: () => void;

  // Organization users state
  users: OrganizationUsers | null;
  isLoadingUsers: boolean;
  usersError: Error | null;
  refreshUsers: (silently?: boolean) => Promise<void>;

  // Current note state
  currentNote: NoteWithContent | null;
  isLoadingNote: boolean;
  noteError: Error | null;
  loadNote: (noteId: string) => Promise<void>;
  updateNoteTitle: (newTitle: string, noteId: ID) => void;

  /**
   * The one writer for the current note's own fields. Shared so the editor's
   * title and the publishing form's Details cannot patch the note at once.
   */
  saveDetailsSoon: NoteDetailsSaver['saveDetailsSoon'];
  saveDetailsNow: NoteDetailsSaver['saveDetailsNow'];

  // Editor state
  editor: Editor | null;
  setEditor: (editor: Editor | null) => void;

  // General loading state (true if any of the above are loading)
  isLoading: boolean;

  // Fetch all data at once
  refreshAll: () => Promise<void>;

  activeNoteId: string | null;
}

const NotebookContext = createContext<NotebookContextType | null>(null);

interface NotebookProviderProps {
  readonly children: ReactNode;
  readonly noteId?: string;
}

export function NotebookProvider({ children, noteId: explicitNoteId }: NotebookProviderProps) {
  const params = useParams();
  const activeNoteId = explicitNoteId ?? (params?.noteId as string) ?? null;

  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();

  // The organization's notes, loaded as soon as the organization is known.
  const notesList = useOrganizationNotes(selectedOrg?.slug, { waiting: isLoadingOrg });
  const { setNotes, refresh: refreshNotes } = notesList;

  // Organization users state
  const [users, setUsers] = useState<OrganizationUsers | null>(null);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState<Error | null>(null);

  // Current note state
  const [currentNote, setCurrentNote] = useState<NoteWithContent | null>(null);
  const [isLoadingNote, setIsLoadingNote] = useState(false);
  const [noteError, setNoteError] = useState<Error | null>(null);
  const lastLoadedNoteIdRef = useRef<string | null>(null);

  // Editor state
  const [editor, setEditor] = useState<Editor | null>(null);

  const { saveDetailsSoon, saveDetailsNow } = useNoteDetailsSaver(currentNote?.id);

  const fetchUsers = useCallback(async (orgId: string, silently = false) => {
    if (!silently) {
      setIsLoadingUsers(true);
      setUsersError(null);
    }

    try {
      const usersData = await OrganizationService.getOrganizationUsers(orgId);
      setUsers(usersData);
    } catch (err) {
      if (!silently) {
        setUsersError(err instanceof Error ? err : new Error('Failed to load organization users'));
      }
    } finally {
      if (!silently) {
        setIsLoadingUsers(false);
      }
    }
  }, []);

  const refreshUsers = useCallback(
    async (silently = false) => {
      if (!selectedOrg?.id) {
        if (!silently) {
          setUsersError(new Error('No organization ID provided'));
        }
        return;
      }
      await fetchUsers(selectedOrg.id.toString(), silently);
    },
    [selectedOrg?.id, fetchUsers]
  );

  const loadNote = useCallback(async (noteId: string) => {
    if (noteId === lastLoadedNoteIdRef.current) {
      return;
    }

    setIsLoadingNote(true);
    setNoteError(null);

    try {
      const note = await NoteService.getNote(noteId);

      setCurrentNote(note);
      lastLoadedNoteIdRef.current = noteId;
    } catch (err) {
      setNoteError(err instanceof Error ? err : new Error('Failed to load note'));
      setCurrentNote(null);
    } finally {
      setIsLoadingNote(false);
    }
  }, []);

  // The save that reports a title can complete — or a pending autosave can
  // flush — after the user moved to another note, so the reported id is the
  // only trustworthy scope: both the list row and the current note update
  // only when they are the note that actually saved.
  const updateNoteTitle = useCallback((newTitle: string, noteId: ID) => {
    if (noteId == null) return;
    const savedId = noteId.toString();

    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id.toString() === savedId
          ? {
              ...note,
              title: newTitle,
            }
          : note
      )
    );

    setCurrentNote((prev) =>
      prev && prev.id.toString() === savedId ? { ...prev, title: newTitle } : prev
    );
  }, []);

  const refreshAll = useCallback(async () => {
    if (!selectedOrg?.slug || !selectedOrg?.id) return;

    const promises = [refreshNotes(), fetchUsers(selectedOrg.id.toString())];
    if (activeNoteId) {
      promises.push(loadNote(activeNoteId));
    }

    await Promise.all(promises);
  }, [selectedOrg?.slug, selectedOrg?.id, activeNoteId, refreshNotes, fetchUsers, loadNote]);

  // Users load when the organization changes; the notes list does the same on its own.
  useEffect(() => {
    if (isLoadingOrg) {
      setIsLoadingUsers(true);
      return;
    }

    if (!selectedOrg) {
      setUsers(null);
      setUsersError(null);
      setIsLoadingUsers(false);
      return;
    }

    fetchUsers(selectedOrg.id.toString());
  }, [selectedOrg?.id, isLoadingOrg, fetchUsers]);

  useEffect(() => {
    if (activeNoteId) {
      loadNote(activeNoteId);
    }
  }, [activeNoteId, loadNote]);

  // Calculate overall loading state ignoring isLoadingNote
  const isLoading = notesList.isLoading || isLoadingUsers || isLoadingOrg;

  const value = {
    notes: notesList.notes,
    setNotes,
    isLoadingNotes: notesList.isLoading,
    isLoadingMoreNotes: notesList.isLoadingMore,
    notesError: notesList.error,
    totalCount: notesList.totalCount,
    hasMoreNotes: notesList.hasMore,
    refreshNotes,
    loadMoreNotes: notesList.loadMore,
    users,
    isLoadingUsers,
    usersError,
    refreshUsers,
    currentNote,
    isLoadingNote,
    noteError,
    loadNote,
    updateNoteTitle,
    saveDetailsSoon,
    saveDetailsNow,
    editor,
    setEditor,
    isLoading,
    refreshAll,
    activeNoteId,
  };

  // The publishing form reads a narrow host rather than this whole context,
  // so the AI Mode document pane can host it too.
  const publishingHost = useMemo<PublishingHost>(
    () => ({ note: currentNote, editor, isLoading, saveDetailsSoon, saveDetailsNow }),
    [currentNote, editor, isLoading, saveDetailsSoon, saveDetailsNow]
  );

  return (
    <NotebookContext.Provider value={value}>
      <PublishingHostProvider value={publishingHost}>{children}</PublishingHostProvider>
    </NotebookContext.Provider>
  );
}

export function useNotebookContext() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebookContext must be used within a NotebookProvider');
  }
  return context;
}
