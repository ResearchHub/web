'use client';

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'notebook:agent-chat-width';

export const MIN_AGENT_CHAT_WIDTH = 360;
export const MAX_AGENT_CHAT_WIDTH = 640;
export const DEFAULT_AGENT_CHAT_WIDTH = 420;

const clampWidth = (value: number) =>
  Math.min(MAX_AGENT_CHAT_WIDTH, Math.max(MIN_AGENT_CHAT_WIDTH, Math.round(value)));

export interface AgentChatWidth {
  readonly width: number;
  /** True while a pointer drag is in flight — hosts suspend width transitions. */
  readonly isResizing: boolean;
  readonly startResize: () => void;
  /** Keyboard resize: negative grows the panel (its divider sits on the left). */
  readonly nudgeWidth: (deltaX: number) => void;
}

/**
 * Width of the right-docked assistant panel, persisted per browser.
 *
 * The panel is anchored to the viewport's right edge, so a drag maps to
 * `innerWidth - clientX` and the arrow keys are inverted the same way: moving
 * the divider left makes the panel wider.
 */
export function useAgentChatWidth(): AgentChatWidth {
  // Read after mount, never during initialization: localStorage is unavailable
  // on the server and a differing first client render would hydrate-mismatch.
  const [width, setWidth] = useState(DEFAULT_AGENT_CHAT_WIDTH);
  const [hydrated, setHydrated] = useState(false);
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    if (Number.isFinite(stored) && stored > 0) setWidth(clampWidth(stored));
    setHydrated(true);
  }, []);

  const startResize = useCallback(() => setIsResizing(true), []);

  const nudgeWidth = useCallback((deltaX: number) => {
    setWidth((current) => clampWidth(current - deltaX));
  }, []);

  useEffect(() => {
    if (!isResizing) return;

    const handleMove = (event: PointerEvent) => {
      event.preventDefault();
      setWidth(clampWidth(window.innerWidth - event.clientX));
    };
    const stopResize = () => setIsResizing(false);

    // The drag crosses the editor, which would otherwise select text under the
    // cursor and swap to an I-beam halfway through.
    const previousUserSelect = document.body.style.userSelect;
    const previousCursor = document.body.style.cursor;
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', stopResize);
    window.addEventListener('pointercancel', stopResize);

    return () => {
      document.body.style.userSelect = previousUserSelect;
      document.body.style.cursor = previousCursor;
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', stopResize);
      window.removeEventListener('pointercancel', stopResize);
    };
  }, [isResizing]);

  // Persist only once a gesture settles, so a drag doesn't write on every frame.
  useEffect(() => {
    if (!hydrated || isResizing) return;
    window.localStorage.setItem(STORAGE_KEY, String(width));
  }, [hydrated, isResizing, width]);

  return { width, isResizing, startResize, nudgeWidth };
}
