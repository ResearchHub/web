'use client';

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { NoteService } from '@/services/note.service';
import { OrganizationService } from '@/services/organization.service';
import type { Note, NoteWithContent } from '@/types/note';
import type { OrganizationUsers } from '@/types/organization';
import { useOrganizationContext } from './OrganizationContext';
import { Editor } from '@tiptap/core';
import { useParams } from 'next/navigation';

interface NotebookContextType {
  // Notes list state
  notes: Note[];
  setNotes: React.Dispatch<React.SetStateAction<Note[]>>;
  isLoadingNotes: boolean;
  notesError: Error | null;
  totalCount: number;
  refreshNotes: () => Promise<void>;

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
  updateNoteTitle: (newTitle: string) => void;

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

  // Notes list state
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(true);
  const [notesError, setNotesError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);

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

  const fetchNotes = useCallback(async (slug?: string) => {
    if (!slug) {
      setNotesError(new Error('No organization slug provided'));
      return;
    }

    setIsLoadingNotes(true);
    setNotesError(null);

    try {
      const data = await NoteService.getOrganizationNotes(slug);

      setNotes(data.results);
      setTotalCount(data.count);
    } catch (err) {
      setNotesError(err instanceof Error ? err : new Error('Failed to load notes'));
      setNotes([]);
      setTotalCount(0);
    } finally {
      setIsLoadingNotes(false);
    }
  }, []);

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

  const refreshNotes = useCallback(async () => {
    if (!selectedOrg?.slug) {
      setNotesError(new Error('No organization slug provided'));
      return;
    }
    await fetchNotes(selectedOrg.slug);
  }, [selectedOrg?.slug, fetchNotes]);

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

  const updateNoteTitle = useCallback(
    (newTitle: string) => {
      if (!activeNoteId) return;

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id.toString() === activeNoteId
            ? {
                ...note,
                title: newTitle,
              }
            : note
        )
      );

      if (currentNote) {
        setCurrentNote((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
    },
    [activeNoteId, currentNote]
  );

  const refreshAll = useCallback(async () => {
    if (!selectedOrg?.slug || !selectedOrg?.id) return;

    const promises = [fetchNotes(selectedOrg.slug), fetchUsers(selectedOrg.id.toString())];
    if (activeNoteId) {
      promises.push(loadNote(activeNoteId));
    }

    await Promise.all(promises);
  }, [selectedOrg?.slug, selectedOrg?.id, activeNoteId, fetchNotes, fetchUsers, loadNote]);

  // Initial data loading when organization changes
  useEffect(() => {
    if (isLoadingOrg) {
      setIsLoadingNotes(true);
      setIsLoadingUsers(true);
      return;
    }

    if (!selectedOrg) {
      setNotes([]);
      setTotalCount(0);
      setUsers(null);
      setNotesError(null);
      setUsersError(null);
      setIsLoadingNotes(false);
      setIsLoadingUsers(false);
      return;
    }

    fetchNotes(selectedOrg.slug);
    fetchUsers(selectedOrg.id.toString());
  }, [selectedOrg?.slug, selectedOrg?.id, isLoadingOrg, fetchNotes, fetchUsers]);

  useEffect(() => {
    if (activeNoteId) {
      loadNote(activeNoteId);
    }
  }, [activeNoteId, loadNote]);

  // Calculate overall loading state ignoring isLoadingNote
  const isLoading = isLoadingNotes || isLoadingUsers || isLoadingOrg;

  const value = {
    notes,
    setNotes,
    isLoadingNotes,
    notesError,
    totalCount,
    refreshNotes,
    users,
    isLoadingUsers,
    usersError,
    refreshUsers,
    currentNote,
    isLoadingNote,
    noteError,
    loadNote,
    updateNoteTitle,
    editor,
    setEditor,
    isLoading,
    refreshAll,
    activeNoteId,
  };

  return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>;
}

export function useNotebookContext() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebookContext must be used within a NotebookProvider');
  }
  return context;
}
