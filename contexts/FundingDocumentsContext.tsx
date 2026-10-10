'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useOrganizationContext } from '@/contexts/OrganizationContext';
import { useUser } from '@/contexts/UserContext';
import { NoteService, type GetOrganizationNotesParams } from '@/services/note.service';
import type { Note } from '@/types/note';
import type { ID } from '@/types/root';

export type FundingDocumentsStatus = 'off' | 'loading' | 'ready' | 'error';

export interface FundingDocuments {
  /** RFPs and proposals without a post, latest edit first. */
  readonly drafts: readonly Note[];
  /** RFPs and proposals with a post, open or inactive, latest edit first. */
  readonly published: readonly Note[];
  /** How many drafts the server has, which can be more than are loaded. */
  readonly draftCount: number;
  /** `off` until there is a signed-in user with an organization; `loading` only before the first load. */
  readonly status: FundingDocumentsStatus;
  /** Load both lists again: after "Try again", or once something was published. */
  readonly refresh: () => Promise<void>;
  /** A draft just created here; it leads the list at once. */
  readonly addDraft: (note: Note) => void;
  /** A document changed here: its row says so at once. */
  readonly patch: (noteId: ID, changes: Partial<Pick<Note, 'title' | 'updatedDate'>>) => void;
  /** A document deleted here: its row goes at once. */
  readonly remove: (noteId: ID) => void;
}

const noop = () => {};

const OFF: FundingDocuments = {
  drafts: [],
  published: [],
  draftCount: 0,
  status: 'off',
  refresh: async () => {},
  addDraft: noop,
  patch: noop,
  remove: noop,
};

const FundingDocumentsContext = createContext<FundingDocuments>(OFF);

/** The two kinds of document the funding side drafts and publishes. */
const FUNDING_DOCUMENT_TYPES = ['PREREGISTRATION', 'GRANT'] as const;

interface DocumentLists {
  /** Whose lists these are: `user:organization`. */
  readonly key: string | null;
  readonly drafts: Note[];
  readonly published: Note[];
  readonly draftCount: number;
}

const EMPTY: DocumentLists = { key: null, drafts: [], published: [], draftCount: 0 };

const byLatestEdit = (a: Note, b: Note) =>
  new Date(b.updatedDate).getTime() - new Date(a.updatedDate).getTime();

/**
 * One status's documents of both types. The listing filters by one type at a
 * time, so each type is its own request and the two are merged here.
 */
async function loadDocuments(
  orgSlug: string,
  status: NonNullable<GetOrganizationNotesParams['status']>
): Promise<{ notes: Note[]; count: number }> {
  const pages = await Promise.all(
    FUNDING_DOCUMENT_TYPES.map((documentType) =>
      NoteService.getOrganizationNotes(orgSlug, { status, documentType, ordering: '-updated_date' })
    )
  );
  const byId = new Map(pages.flatMap((page) => page.results).map((note) => [note.id, note]));
  return {
    notes: Array.from(byId.values())
      .filter((note) => !note.isRemoved)
      .sort(byLatestEdit),
    count: pages.reduce((total, page) => total + page.count, 0),
  };
}

/**
 * The user's RFPs and proposals, drafts and published, loaded once for the
 * whole app: the sidebar shows them on every page and My Funding lists the
 * drafts, and moving between pages never fetches them again. Reloads when the
 * user or the organization changes, and when asked to.
 */
export function FundingDocumentsProvider({ children }: { readonly children: ReactNode }) {
  const { user } = useUser();
  const { selectedOrg, isLoading: isLoadingOrg } = useOrganizationContext();
  const userId = user?.id ?? null;
  const orgSlug = selectedOrg?.slug ?? null;
  const key = userId != null && orgSlug != null ? `${userId}:${orgSlug}` : null;

  const [loaded, setLoaded] = useState<DocumentLists>(EMPTY);
  // The first load for this key failed; a reload that fails keeps what it had.
  const [failedKey, setFailedKey] = useState<string | null>(null);
  // Only the latest load may land: a slower, older one would put back what
  // a newer one replaced, or another user's documents.
  const seqRef = useRef(0);

  const load = useCallback(async (slug: string, forKey: string) => {
    const seq = ++seqRef.current;
    try {
      const [drafts, published] = await Promise.all([
        loadDocuments(slug, 'DRAFT'),
        loadDocuments(slug, 'PUBLISHED'),
      ]);
      if (seq !== seqRef.current) return;
      setLoaded({
        key: forKey,
        drafts: drafts.notes,
        published: published.notes,
        draftCount: drafts.count,
      });
      setFailedKey(null);
    } catch (error) {
      if (seq !== seqRef.current) return;
      console.error('Failed to load funding documents:', error);
      setFailedKey(forKey);
    }
  }, []);

  useEffect(() => {
    if (key == null || orgSlug == null) {
      seqRef.current += 1;
      return;
    }
    void load(orgSlug, key);
    // The key already says which organization.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, load]);

  const lists = loaded.key === key ? loaded : EMPTY;
  const status: FundingDocumentsStatus =
    key == null
      ? userId != null && isLoadingOrg
        ? 'loading'
        : 'off'
      : loaded.key === key
        ? 'ready'
        : failedKey === key
          ? 'error'
          : 'loading';

  const refresh = useCallback(async () => {
    if (key == null || orgSlug == null) return;
    setFailedKey(null);
    await load(orgSlug, key);
  }, [key, orgSlug, load]);

  const addDraft = useCallback((note: Note) => {
    setLoaded((current) => {
      const known = current.drafts.some((draft) => draft.id === note.id);
      return {
        ...current,
        drafts: [note, ...current.drafts.filter((draft) => draft.id !== note.id)],
        draftCount: current.draftCount + (known ? 0 : 1),
      };
    });
  }, []);

  const patch = useCallback((noteId: ID, changes: Partial<Pick<Note, 'title' | 'updatedDate'>>) => {
    const update = (notes: Note[]) => {
      const target = notes.find((note) => note.id === noteId);
      const changed =
        target != null &&
        Object.entries(changes).some(
          ([field, value]) => target[field as keyof typeof changes] !== value
        );
      if (!changed) return notes;
      const next = notes.map((note) => (note.id === noteId ? { ...note, ...changes } : note));
      return changes.updatedDate ? next.sort(byLatestEdit) : next;
    };
    setLoaded((current) => {
      const drafts = update(current.drafts);
      const published = update(current.published);
      return drafts === current.drafts && published === current.published
        ? current
        : { ...current, drafts, published };
    });
  }, []);

  const remove = useCallback((noteId: ID) => {
    setLoaded((current) => {
      const wasDraft = current.drafts.some((note) => note.id === noteId);
      return {
        ...current,
        drafts: current.drafts.filter((note) => note.id !== noteId),
        published: current.published.filter((note) => note.id !== noteId),
        draftCount: Math.max(0, current.draftCount - (wasDraft ? 1 : 0)),
      };
    });
  }, []);

  const value = useMemo<FundingDocuments>(
    () => ({
      drafts: lists.drafts,
      published: lists.published,
      draftCount: lists.draftCount,
      status,
      refresh,
      addDraft,
      patch,
      remove,
    }),
    [lists, status, refresh, addDraft, patch, remove]
  );

  return (
    <FundingDocumentsContext.Provider value={value}>{children}</FundingDocumentsContext.Provider>
  );
}

/** The user's RFPs and proposals; switched off (and empty) outside the provider. */
export function useFundingDocuments(): FundingDocuments {
  return useContext(FundingDocumentsContext);
}
