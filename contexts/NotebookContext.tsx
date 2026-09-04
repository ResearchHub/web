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
import type { ID } from '@/types/root';
import type { OrganizationUsers } from '@/types/organization';
import { useOrganizationContext } from './OrganizationContext';
import { useNoteDetailsSaver, type NoteDetailsSaver } from '@/hooks/useNoteDetailsSaver';
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

const mergeNotesById = (notes: Note[], otherNotes: Note[]): Note[] =>
  Array.from(new Map([...notes, ...otherNotes].map((note) => [note.id, note])).values());

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
  const [isLoadingMoreNotes, setIsLoadingMoreNotes] = useState(false);
  const [notesError, setNotesError] = useState<Error | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [nextPageUrls, setNextPageUrls] = useState<string[]>([]);

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

  const fetchNotes = useCallback(async (slug?: string) => {
    if (!slug) {
      setNotesError(new Error('No organization slug provided'));
      return;
    }

    setIsLoadingNotes(true);
    setIsLoadingMoreNotes(false);
    setNotesError(null);
    setNextPageUrls([]);

    try {
      const [organizationNotes, registeredReports] = await Promise.all([
        NoteService.getOrganizationNotes(slug),
        NoteService.getOrganizationNotes(slug, {
          documentType: 'REGISTERED_REPORT',
        }),
      ]);
      const mergedNotes = mergeNotesById(organizationNotes.results, registeredReports.results);

      setNotes(mergedNotes);
      setTotalCount(Math.max(organizationNotes.count, mergedNotes.length));
      setNextPageUrls(
        [organizationNotes.next, registeredReports.next].filter((url) => url !== null)
      );
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

  const loadMoreNotes = () => {
    if (isLoadingMoreNotes || nextPageUrls.length === 0) return;

    setNotesError(null);
    setIsLoadingMoreNotes(true);
  };

  useEffect(() => {
    const slug = selectedOrg?.slug;
    if (!slug || !isLoadingMoreNotes || nextPageUrls.length === 0) return;

    let cancelled = false;

    const fetchNextNotes = async () => {
      try {
        const nextPages = await Promise.all(
          nextPageUrls.map((nextUrl) => NoteService.getOrganizationNotes(slug, { nextUrl }))
        );
        if (cancelled) return;

        const newNotes = nextPages.flatMap((page) => page.results);
        setNotes((currentNotes) => mergeNotesById(currentNotes, newNotes));
        setNextPageUrls(nextPages.flatMap(({ next }) => (next ? [next] : [])));
      } catch (err) {
        if (cancelled) return;
        setNotesError(err instanceof Error ? err : new Error('Failed to load more notes'));
      } finally {
        if (!cancelled) setIsLoadingMoreNotes(false);
      }
    };

    void fetchNextNotes();
    return () => {
      cancelled = true;
    };
  }, [isLoadingMoreNotes, nextPageUrls, selectedOrg?.slug]);

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
      setIsLoadingMoreNotes(false);
      setNextPageUrls([]);
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
  const hasMoreNotes = nextPageUrls.length > 0;

  const value = {
    notes,
    setNotes,
    isLoadingNotes,
    isLoadingMoreNotes,
    notesError,
    totalCount,
    hasMoreNotes,
    refreshNotes,
    loadMoreNotes,
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

  return <NotebookContext.Provider value={value}>{children}</NotebookContext.Provider>;
}

export function useNotebookContext() {
  const context = useContext(NotebookContext);
  if (!context) {
    throw new Error('useNotebookContext must be used within a NotebookProvider');
  }
  return context;
}
