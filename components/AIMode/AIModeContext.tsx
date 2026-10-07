'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useSearchParams } from 'next/navigation';
import {
  documentTarget,
  readWorkspaceTarget,
  sameTarget,
  workspaceHref,
  type DocumentChat,
  type WorkspaceTarget,
} from './workspaceUrl';

export interface AIModeContextValue {
  /** What the workspace is open on, as the URL says. */
  readonly target: WorkspaceTarget;
  selectTarget: (target: WorkspaceTarget) => void;
  /** Open a document, on its most recent chat unless another is named. */
  selectDocument: (noteId: number, chat?: DocumentChat) => void;
  /**
   * The open document while the assistant works on it, for the sidebar's
   * row. Only the open one is known without asking the server, so only it
   * is marked.
   */
  readonly workingNoteId: number | null;
  setWorkingNoteId: (noteId: number | null) => void;
}

const AIModeContext = createContext<AIModeContextValue | null>(null);

/**
 * Owns what the workspace page is open on. It lives in the URL, so a reload
 * or a shared link lands on the same document and chat.
 *
 * Mounted by the `/workspace` page, not globally: the doors elsewhere in the
 * app are plain links built with `workspaceHref`. Reads the URL with
 * `useSearchParams`, so it needs a Suspense boundary above it.
 */
export function AIModeProvider({ children }: { readonly children: ReactNode }) {
  const searchParams = useSearchParams();
  // The same object until the target itself changes, so effects keyed on it
  // do not re-run with every render or unrelated param.
  const parsed = readWorkspaceTarget(searchParams);
  const targetRef = useRef(parsed);
  if (!sameTarget(targetRef.current, parsed)) targetRef.current = parsed;
  const target = targetRef.current;

  const selectTarget = useCallback((next: WorkspaceTarget) => {
    if (sameTarget(next, targetRef.current)) return;
    // Replaced, not pushed: the workspace is one history entry however many
    // documents and chats are opened in it, so Back leaves in a single step. Native
    // history with no state of our own, which the app router picks up and
    // feeds back through useSearchParams without fetching anything.
    window.history.replaceState(null, '', `${workspaceHref(next)}${window.location.hash}`);
  }, []);
  const selectDocument = useCallback(
    (noteId: number, chat?: DocumentChat) => selectTarget(documentTarget(noteId, chat)),
    [selectTarget]
  );

  const [workingNoteId, setWorkingNoteId] = useState<number | null>(null);

  const value = useMemo<AIModeContextValue>(
    () => ({ target, selectTarget, selectDocument, workingNoteId, setWorkingNoteId }),
    [target, selectTarget, selectDocument, workingNoteId]
  );

  return <AIModeContext.Provider value={value}>{children}</AIModeContext.Provider>;
}

export function useAIMode(): AIModeContextValue {
  const context = useContext(AIModeContext);
  if (context == null) {
    throw new Error('useAIMode must be used within AIModeProvider');
  }
  return context;
}

/** Same as {@link useAIMode} but null anywhere other than the workspace page. */
export function useOptionalAIMode(): AIModeContextValue | null {
  return useContext(AIModeContext);
}
