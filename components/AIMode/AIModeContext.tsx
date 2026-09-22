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
import type { FundingIntent } from '@/components/Funding/fundingDirection';
import type { SelectedGrantDetails } from '@/types/grant';

/**
 * `?ai=1` opens the workspace. `aiChat=<id>` selects a conversation;
 * `aiNote=<id>` opens a document, with `aiChat` then naming the chat on that
 * document. `aiView=chat` puts that chat, not the document, in the main pane
 * (a conversation opened from the list); absent, the document comes first.
 */
export const AI_MODE_OPEN_PARAM = 'ai';
export const AI_MODE_CHAT_PARAM = 'aiChat';
export const AI_MODE_NOTE_PARAM = 'aiNote';
export const AI_MODE_VIEW_PARAM = 'aiView';

/** Which pane is the main one; the other sits at a fixed width beside it. */
export type WorkspaceLayout = 'chat' | 'document';

/**
 * What the workspace is open on: one of the user's conversations (null = the
 * new-conversation screen), or a document with a chat scoped to it (null =
 * a chat not yet started). A document target remembers how it was reached:
 * opened as a document it comes first, opened as a conversation its chat does.
 */
export type WorkspaceTarget =
  | { readonly kind: 'conversation'; readonly chatId: number | null }
  | {
      readonly kind: 'document';
      readonly noteId: number;
      readonly chatId: number | null;
      readonly layout: WorkspaceLayout;
    };

export const layoutFor = (target: WorkspaceTarget): WorkspaceLayout =>
  target.kind === 'document' ? target.layout : 'chat';

interface AIModeUrlState {
  readonly isOpen: boolean;
  readonly target: WorkspaceTarget;
}

const NEW_CONVERSATION: WorkspaceTarget = { kind: 'conversation', chatId: null };
const CLOSED: AIModeUrlState = { isOpen: false, target: NEW_CONVERSATION };

/**
 * A conversation started from outside the workspace — the My Funding page's
 * composer: what it is for, the first message, and for a researcher the RFP
 * they mean to apply to. The workspace opens on the new-conversation screen
 * and sends the message as soon as it mounts.
 */
export interface PendingStart {
  readonly intent: FundingIntent;
  readonly message: string;
  readonly selectedGrant: SelectedGrantDetails | null;
}

export interface AIModeContextValue extends AIModeUrlState {
  /** Open on the last target, or the new-conversation screen. */
  open: () => void;
  /** Open on a fresh conversation and send its first message. */
  startConversation: (start: PendingStart) => void;
  /** The start handed over by {@link startConversation}, once; null after. */
  takePendingStart: () => PendingStart | null;
  close: () => void;
  toggle: () => void;
  /** Open on a target. */
  selectTarget: (target: WorkspaceTarget) => void;
  /** Select a conversation (null = the new-conversation screen), opening if needed. */
  selectChat: (chatId: number | null) => void;
  /** Open a document with a fresh chat beside it. */
  selectDocument: (noteId: number) => void;
}

const AIModeContext = createContext<AIModeContextValue | null>(null);

function parseId(raw: string | null): number | null {
  if (raw == null) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

function readUrlState(params: URLSearchParams): AIModeUrlState {
  if (params.get(AI_MODE_OPEN_PARAM) !== '1') return CLOSED;
  const chatId = parseId(params.get(AI_MODE_CHAT_PARAM));
  const noteId = parseId(params.get(AI_MODE_NOTE_PARAM));
  const layout: WorkspaceLayout = params.get(AI_MODE_VIEW_PARAM) === 'chat' ? 'chat' : 'document';
  const target: WorkspaceTarget =
    noteId != null
      ? { kind: 'document', noteId, chatId, layout }
      : { kind: 'conversation', chatId };
  return { isOpen: true, target };
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
    if (state.target.layout === 'chat') params.set(AI_MODE_VIEW_PARAM, 'chat');
  }
}

const sameTarget = (a: WorkspaceTarget, b: WorkspaceTarget): boolean =>
  a.kind === b.kind &&
  a.chatId === b.chatId &&
  (a.kind !== 'document' ||
    b.kind !== 'document' ||
    (a.noteId === b.noteId && a.layout === b.layout));

/**
 * Reads the overlay's URL state. Isolated behind Suspense because
 * `useSearchParams` de-opts a statically rendered page up to the nearest
 * boundary; the provider itself stays synchronous so nothing above it is
 * affected.
 */
function AIModeUrlSync({ onChange }: { readonly onChange: (state: AIModeUrlState) => void }) {
  const searchParams = useSearchParams();
  const { isOpen, target } = readUrlState(searchParams);
  const { chatId } = target;
  const noteId = target.kind === 'document' ? target.noteId : null;
  const layout = target.kind === 'document' ? target.layout : null;
  // Rebuilt from its parts so the effect runs on a change of state, not on
  // every render's fresh object.
  useEffect(() => {
    onChange({
      isOpen,
      target:
        noteId != null && layout != null
          ? { kind: 'document', noteId, chatId, layout }
          : { kind: 'conversation', chatId },
    });
  }, [isOpen, chatId, noteId, layout, onChange]);
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
  const lastRef = useRef<WorkspaceTarget | null>(null);
  if (state.isOpen && !sameTarget(state.target, NEW_CONVERSATION)) {
    lastRef.current = state.target;
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
    (target: WorkspaceTarget) => {
      if (sameTarget(target, NEW_CONVERSATION)) lastRef.current = null;
      navigate({ isOpen: true, target });
    },
    [navigate]
  );
  const open = useCallback(() => {
    navigate({ isOpen: true, target: lastRef.current ?? NEW_CONVERSATION });
  }, [navigate]);
  const close = useCallback(() => navigate(CLOSED), [navigate]);
  const selectChat = useCallback(
    (chatId: number | null) => selectTarget({ kind: 'conversation', chatId }),
    [selectTarget]
  );
  const selectDocument = useCallback(
    (noteId: number) =>
      selectTarget({ kind: 'document', noteId, chatId: null, layout: 'document' }),
    [selectTarget]
  );

  // Held until the workspace's chat hook mounts and asks for it, so the page
  // that starts a conversation needs no chat state of its own.
  const pendingStartRef = useRef<PendingStart | null>(null);
  const startConversation = useCallback(
    (start: PendingStart) => {
      pendingStartRef.current = start;
      selectTarget(NEW_CONVERSATION);
    },
    [selectTarget]
  );
  const takePendingStart = useCallback(() => {
    const start = pendingStartRef.current;
    pendingStartRef.current = null;
    return start;
  }, []);

  const stateRef = useRef(state);
  stateRef.current = state;
  const toggle = useCallback(() => {
    if (stateRef.current.isOpen) close();
    else open();
  }, [open, close]);

  const value = useMemo<AIModeContextValue>(
    () => ({
      ...state,
      open,
      close,
      toggle,
      selectTarget,
      selectChat,
      selectDocument,
      startConversation,
      takePendingStart,
    }),
    [
      state,
      open,
      close,
      toggle,
      selectTarget,
      selectChat,
      selectDocument,
      startConversation,
      takePendingStart,
    ]
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
