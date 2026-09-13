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

/** `?ai=1` opens the overlay; `?ai=1&aiChat=<id>` selects a conversation. */
export const AI_MODE_OPEN_PARAM = 'ai';
export const AI_MODE_CHAT_PARAM = 'aiChat';

interface AIModeUrlState {
  isOpen: boolean;
  chatId: number | null;
}

export interface AIModeContextValue extends AIModeUrlState {
  /** Open on the last selected conversation, or the new-conversation screen. */
  open: () => void;
  close: () => void;
  toggle: () => void;
  /** Select a conversation (null = the new-conversation screen), opening if needed. */
  selectChat: (chatId: number | null) => void;
}

const AIModeContext = createContext<AIModeContextValue | null>(null);

function parseChatId(raw: string | null): number | null {
  if (raw == null) return null;
  const parsed = Number.parseInt(raw, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

/**
 * Reads the overlay's URL state. Isolated behind Suspense because
 * `useSearchParams` de-opts a statically rendered page up to the nearest
 * boundary; the provider itself stays synchronous so nothing above it is
 * affected.
 */
function AIModeUrlSync({ onChange }: { readonly onChange: (state: AIModeUrlState) => void }) {
  const searchParams = useSearchParams();
  const isOpen = searchParams.get(AI_MODE_OPEN_PARAM) === '1';
  const chatId = isOpen ? parseChatId(searchParams.get(AI_MODE_CHAT_PARAM)) : null;
  useEffect(() => {
    onChange({ isOpen, chatId });
  }, [isOpen, chatId, onChange]);
  return null;
}

const AIModeOverlay = dynamic(
  () => import('./AIModeOverlay').then((module) => module.AIModeOverlay),
  { ssr: false }
);

/**
 * Owns the AI Mode overlay: its open/selected state lives in the URL, so a
 * reload or a shared link lands on the same conversation, and any client-side
 * navigation to another page naturally drops the params and closes it.
 *
 * Mounted once, globally. The overlay body is lazy-loaded so a session that
 * never opens it pays nothing.
 */
export function AIModeProvider({ children }: { readonly children: ReactNode }) {
  const pathname = usePathname();
  const [state, setState] = useState<AIModeUrlState>({ isOpen: false, chatId: null });
  // Closing drops the chat from the URL; reopening from the sidebar in the same
  // page session should still return to it. In memory only — a reload starts
  // from whatever the URL says.
  const lastChatIdRef = useRef<number | null>(null);
  if (state.chatId != null) lastChatIdRef.current = state.chatId;

  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  const navigate = useCallback((next: AIModeUrlState) => {
    // Event-handler only, so window is available; keeps every unrelated
    // query param the page already carries.
    const params = new URLSearchParams(window.location.search);
    if (next.isOpen) {
      params.set(AI_MODE_OPEN_PARAM, '1');
    } else {
      params.delete(AI_MODE_OPEN_PARAM);
    }
    if (next.isOpen && next.chatId != null) {
      params.set(AI_MODE_CHAT_PARAM, String(next.chatId));
    } else {
      params.delete(AI_MODE_CHAT_PARAM);
    }
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

  const open = useCallback(() => {
    navigate({ isOpen: true, chatId: lastChatIdRef.current });
  }, [navigate]);
  const close = useCallback(() => navigate({ isOpen: false, chatId: null }), [navigate]);
  const selectChat = useCallback(
    (chatId: number | null) => {
      if (chatId == null) lastChatIdRef.current = null;
      navigate({ isOpen: true, chatId });
    },
    [navigate]
  );

  const stateRef = useRef(state);
  stateRef.current = state;
  const toggle = useCallback(() => {
    if (stateRef.current.isOpen) close();
    else open();
  }, [open, close]);

  const value = useMemo<AIModeContextValue>(
    () => ({ ...state, open, close, toggle, selectChat }),
    [state, open, close, toggle, selectChat]
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
