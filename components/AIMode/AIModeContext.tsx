'use client';

import { createContext, useCallback, useContext, useMemo, useRef, type ReactNode } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  documentTarget,
  readWorkspaceTarget,
  sameTarget,
  workspaceHref,
  type WorkspaceTarget,
} from './workspaceUrl';

export interface AIModeContextValue {
  /** What the workspace is open on, as the URL says. */
  readonly target: WorkspaceTarget;
  selectTarget: (target: WorkspaceTarget) => void;
  /** Select a conversation (null = the new-conversation screen). */
  selectChat: (chatId: number | null) => void;
  /** Open a document with a fresh chat beside it. */
  selectDocument: (noteId: number) => void;
}

const AIModeContext = createContext<AIModeContextValue | null>(null);

/**
 * Owns what the workspace page is open on. It lives in the URL, so a reload
 * or a shared link lands on the same conversation or document.
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
    // conversations are opened in it, so Back leaves in a single step. Native
    // history with no state of our own, which the app router picks up and
    // feeds back through useSearchParams without fetching anything.
    window.history.replaceState(null, '', `${workspaceHref(next)}${window.location.hash}`);
  }, []);
  const selectChat = useCallback(
    (chatId: number | null) => selectTarget({ kind: 'conversation', chatId }),
    [selectTarget]
  );
  const selectDocument = useCallback(
    (noteId: number) => selectTarget(documentTarget(noteId)),
    [selectTarget]
  );

  const value = useMemo<AIModeContextValue>(
    () => ({ target, selectTarget, selectChat, selectDocument }),
    [target, selectTarget, selectChat, selectDocument]
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
