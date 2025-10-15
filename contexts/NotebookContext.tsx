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

  // Right sidebar tab state
  activeRightSidebarTab: 'details' | 'ai-assistant';
  setActiveRightSidebarTab: (tab: 'details' | 'ai-assistant') => void;

  // Sidebar width state
  leftSidebarWidth: number;
  setLeftSidebarWidth: (width: number) => void;
  rightSidebarWidth: number;
  setRightSidebarWidth: (width: number) => void;

  // General loading state (true if any of the above are loading)
  isLoading: boolean;

  // Fetch all data at once
  refreshAll: () => Promise<void>;

  noteIdFromParams: string | null;
}

const NotebookContext = createContext<NotebookContextType | null>(null);

export function NotebookProvider({ children }: { children: ReactNode }) {
  const params = useParams();
  const noteIdFromParams = (params?.noteId as string) || null;

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

  // Right sidebar tab state
  const [activeRightSidebarTab, setActiveRightSidebarTab] = useState<'details' | 'ai-assistant'>(
    'details'
  );

  // Sidebar width state
  const [leftSidebarWidth, setLeftSidebarWidth] = useState<number>(300);
  const [rightSidebarWidth, setRightSidebarWidth] = useState<number>(300);

  // Load saved sidebar widths from localStorage
  useEffect(() => {
    const savedLeft = localStorage.getItem('notebook-left-sidebar-width');
    if (savedLeft) {
      const width = parseInt(savedLeft, 10);
      if (!isNaN(width)) {
        setLeftSidebarWidth(width);
      }
    }

    const savedRight = localStorage.getItem('notebook-right-sidebar-width');
    if (savedRight) {
      const width = parseInt(savedRight, 10);
      if (!isNaN(width)) {
        setRightSidebarWidth(width);
      }
    }
  }, []);

  // Persist sidebar widths to localStorage
  useEffect(() => {
    localStorage.setItem('notebook-left-sidebar-width', leftSidebarWidth.toString());
  }, [leftSidebarWidth]);

  useEffect(() => {
    localStorage.setItem('notebook-right-sidebar-width', rightSidebarWidth.toString());
  }, [rightSidebarWidth]);

  // Fetch notes list
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

  // Fetch organization users
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

  // Refresh users
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

  // Refresh notes
  const refreshNotes = useCallback(async () => {
    if (!selectedOrg?.slug) {
      setNotesError(new Error('No organization slug provided'));
      return;
    }
    await fetchNotes(selectedOrg.slug);
  }, [selectedOrg?.slug, fetchNotes]);

  // Modify loadNote with logging
  const loadNote = useCallback(async (noteId: string) => {
    if (noteId === lastLoadedNoteIdRef.current && currentNote) {
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

  // Load a specific note
  const updateNoteTitle = useCallback(
    (newTitle: string) => {
      if (!noteIdFromParams) return;

      setNotes((prevNotes) =>
        prevNotes.map((note) =>
          note.id.toString() === noteIdFromParams
            ? {
                ...note,
                title: newTitle,
              }
            : note
        )
      );

      // Also update the current note data if it exists
      if (currentNote) {
        setCurrentNote((prev) => (prev ? { ...prev, title: newTitle } : null));
      }
    },
    [noteIdFromParams, currentNote]
  );

  // Refresh all data at once
  const refreshAll = useCallback(async () => {
    if (!selectedOrg?.slug || !selectedOrg?.id) {
      return;
    }

    // Start all fetches in parallel
    const promises = [fetchNotes(selectedOrg.slug), fetchUsers(selectedOrg.id.toString())];

    // If we have a current note ID, also refresh that
    if (noteIdFromParams) {
      promises.push(loadNote(noteIdFromParams));
    }

    await Promise.all(promises);
  }, [selectedOrg?.slug, selectedOrg?.id, noteIdFromParams, fetchNotes, fetchUsers, loadNote]);

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

  // Update currentNoteId when URL params change
  useEffect(() => {
    if (noteIdFromParams) {
      loadNote(noteIdFromParams);
    }
  }, [noteIdFromParams, loadNote]);

  // Calculate overall loading state ignoring isLoadingNote
  const isLoading = isLoadingNotes || isLoadingUsers || isLoadingOrg;

  const value = {
    // Notes list state
    notes,
    setNotes,
    isLoadingNotes,
    notesError,
    totalCount,
    refreshNotes,

    // Organization users state
    users,
    isLoadingUsers,
    usersError,
    refreshUsers,

    // Current note state
    currentNote,
    isLoadingNote,
    noteError,
    loadNote,
    updateNoteTitle,

    // Editor state
    editor,
    setEditor,

    // Right sidebar tab state
    activeRightSidebarTab,
    setActiveRightSidebarTab,

    // Sidebar width state
    leftSidebarWidth,
    setLeftSidebarWidth,
    rightSidebarWidth,
    setRightSidebarWidth,

    // General loading state
    isLoading,

    // Fetch all data at once
    refreshAll,

    noteIdFromParams,
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
