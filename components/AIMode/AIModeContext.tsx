'use client';

import {
  createContext,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useSearchParams } from 'next/navigation';

/**
 * `?ai=1` opens the workspace. `aiChat=<id>` selects a conversation;
 * `aiNote=<id>` opens a document, with `aiChat` then naming the chat on that
 * document; `aiView=doc` puts the document in the main pane.
 */
export const AI_MODE_OPEN_PARAM = 'ai';
export const AI_MODE_CHAT_PARAM = 'aiChat';
export const AI_MODE_NOTE_PARAM = 'aiNote';
export const AI_MODE_VIEW_PARAM = 'aiView';
const DOCUMENT_VIEW = 'doc';

/**
 * What the workspace is open on: one of the user's conversations (null = the
 * new-conversation screen), or a document with a chat scoped to it (null =
 * a chat not yet started).
 */
export type WorkspaceTarget =
  | { readonly kind: 'conversation'; readonly chatId: number | null }
  | { readonly kind: 'document'; readonly noteId: number; readonly chatId: number | null };

/** Which pane is the main one; the other sits at a fixed width beside it. */
export type WorkspaceLayout = 'chat' | 'document';

interface AIModeUrlState {
  readonly isOpen: boolean;
  readonly target: WorkspaceTarget;
  readonly layout: WorkspaceLayout;
}

const NEW_CONVERSATION: WorkspaceTarget = { kind: 'conversation', chatId: null };
const CLOSED: AIModeUrlState = { isOpen: false, target: NEW_CONVERSATION, layout: 'chat' };

export interface AIModeContextValue extends AIModeUrlState {
  /** Open on the last target, or the new-conversation screen. */
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Open on a target, laid out as its kind reads best unless told otherwise. */
  selectTarget: (target: WorkspaceTarget, layout?: WorkspaceLayout) => void;
  /** Select a conversation (null = the new-conversation screen), opening if needed. */
  selectChat: (chatId: number | null) => void;
  /** Open a document with a fresh chat beside it. */
  selectDocument: (noteId: number) => void;
  /** Swap which pane is the main one; nothing else changes. */
  setLayout: (layout: WorkspaceLayout) => void;
}

const AIModeContext = createContext<AIModeContextValue | null>(null);

function parseId(raw: string | null): number | null {
  if (raw == null) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/** The layout a target opens in when nothing says otherwise. */
const defaultLayout = (target: WorkspaceTarget): WorkspaceLayout =>
  target.kind === 'document' ? 'document' : 'chat';

function readUrlState(params: URLSearchParams): AIModeUrlState {
  if (params.get(AI_MODE_OPEN_PARAM) !== '1') return CLOSED;
  const chatId = parseId(params.get(AI_MODE_CHAT_PARAM));
  const noteId = parseId(params.get(AI_MODE_NOTE_PARAM));
  const target: WorkspaceTarget =
    noteId != null ? { kind: 'document', noteId, chatId } : { kind: 'conversation', chatId };
  // Only a document can be the main pane.
  const layout: WorkspaceLayout =
    noteId != null && params.get(AI_MODE_VIEW_PARAM) === DOCUMENT_VIEW ? 'document' : 'chat';
  return { isOpen: true, target, layout };
}

function writeUrlState(params: URLSearchParams, state: AIModeUrlState): void {
  for (const key of [
    AI_MODE_OPEN_PARAM,
    AI_MODE_CHAT_PARAM,
    AI_MODE_NOTE_PARAM,
    AI_MODE_VIEW_PARAM,
  ]) {
    params.delete(key);
  }
  if (!state.isOpen) return;
  params.set(AI_MODE_OPEN_PARAM, '1');
  if (state.target.chatId != null) params.set(AI_MODE_CHAT_PARAM, String(state.target.chatId));
  if (state.target.kind === 'document') {
    params.set(AI_MODE_NOTE_PARAM, String(state.target.noteId));
    if (state.layout === 'document') params.set(AI_MODE_VIEW_PARAM, DOCUMENT_VIEW);
  }
}

const sameTarget = (a: WorkspaceTarget, b: WorkspaceTarget): boolean =>
  a.kind === b.kind &&
  a.chatId === b.chatId &&
  (a.kind !== 'document' || b.kind !== 'document' || a.noteId === b.noteId);

/**
 * Reads the overlay's URL state. Isolated behind Suspense because
 * `useSearchParams` de-opts a statically rendered page up to the nearest
 * boundary; the provider itself stays synchronous so nothing above it is
 * affected.
 */
function AIModeUrlSync({ onChange }: { readonly onChange: (state: AIModeUrlState) => void }) {
  const searchParams = useSearchParams();
  const { isOpen, layout, target } = readUrlState(searchParams);
  const { chatId } = target;
  const noteId = target.kind === 'document' ? target.noteId : null;
  // Rebuilt from its parts so the effect runs on a change of state, not on
  // every render's fresh object.
  useEffect(() => {
    onChange({
      isOpen,
      layout,
      target:
        noteId != null ? { kind: 'document', noteId, chatId } : { kind: 'conversation', chatId },
    });
  }, [isOpen, layout, chatId, noteId, onChange]);
  return null;
}

const AIModeOverlay = dynamic(
  () => import('./AIModeOverlay').then((module) => module.AIModeOverlay),
  { ssr: false }
);

/**
 * Owns the AI Mode overlay: what it is open on lives in the URL, so a reload
 * or a shared link lands on the same conversation or document, and any
 * client-side navigation to another page naturally drops the params and
 * closes it.
 *
 * Mounted once, globally. The overlay body is lazy-loaded so a session that
 * never opens it pays nothing.
 */
export function AIModeProvider({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<AIModeUrlState>(CLOSED);
  // Closing drops the target from the URL; reopening from the sidebar in the
  // same page session should still return to it. In memory only — a reload
  // starts from whatever the URL says.
  const lastRef = useRef<Pick<AIModeUrlState, 'target' | 'layout'> | null>(null);
  if (state.isOpen && !sameTarget(state.target, NEW_CONVERSATION)) {
    lastRef.current = { target: state.target, layout: state.layout };
  }

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const navigate = useCallback((next: AIModeUrlState) => {
    // Event-handler only, so window is available; keeps every unrelated
    // query param the page already carries.
    const params = new URLSearchParams(window.location.search);
    writeUrlState(params, next);
    const query = params.toString();
    const hash = window.location.hash;
    // Native history, not router.replace: the app router keeps
    // useSearchParams in sync with it, and unlike a router navigation it
    // neither re-fetches nor re-renders the page behind the overlay.
    window.history.replaceState(
      window.history.state,
      '',
      `${pathnameRef.current}${query ? `?${query}` : ''}${hash}`
    );
    setState(next);
  }, []);

  const selectTarget = useCallback(
    (target: WorkspaceTarget, layout: WorkspaceLayout = defaultLayout(target)) => {
      if (sameTarget(target, NEW_CONVERSATION)) lastRef.current = null;
      navigate({ isOpen: true, target, layout });
    },
    [navigate]
  );
  const open = useCallback(() => {
    const last = lastRef.current;
    navigate(
      last
        ? { isOpen: true, target: last.target, layout: last.layout }
        : { isOpen: true, target: NEW_CONVERSATION, layout: 'chat' }
    );
  }, [navigate]);
  const close = useCallback(() => navigate(CLOSED), [navigate]);
  const selectChat = useCallback(
    (chatId: number | null) => selectTarget({ kind: 'conversation', chatId }),
    [selectTarget]
  );
  const selectDocument = useCallback(
    (noteId: number) => selectTarget({ kind: 'document', noteId, chatId: null }),
    [selectTarget]
  );

  const stateRef = useRef(state);
  stateRef.current = state;
  const setLayout = useCallback(
    (layout: WorkspaceLayout) => navigate({ ...stateRef.current, isOpen: true, layout }),
    [navigate]
  );
  const toggle = useCallback(() => {
    if (stateRef.current.isOpen) close();
    else open();
  }, [open, close]);

  const value = useMemo<AIModeContextValue>(
    () => ({ ...state, open, close, toggle, selectTarget, selectChat, selectDocument, setLayout }),
    [state, open, close, toggle, selectTarget, selectChat, selectDocument, setLayout]
  );

  return (
    <AIModeContext.Provider value={value}>
      {children}
      <Suspense fallback={null}>
        <AIModeUrlSync onChange={setState} />
      </Suspense>
      {state.isOpen && <AIModeOverlay />}
    </AIModeContext.Provider>
  );
}

export function useAIMode(): AIModeContextValue {
  const context = useContext(AIModeContext);
  if (context == null) {
    throw new Error('useAIMode must be used within AIModeProvider');
  }
  return context;
}

/** Same as {@link useAIMode} but tolerates rendering outside the provider. */
export function useOptionalAIMode(): AIModeContextValue | null {
  return useContext(AIModeContext);
}
