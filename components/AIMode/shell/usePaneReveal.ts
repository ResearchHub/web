'use client';

import { useEffect, useState } from 'react';

/** How long a pane that has loaded waits for the other before it shows on its own. */
const HOLD_MS = 400;

/**
 * Whether the open document's panes may show what they have loaded. They
 * are held on their skeletons until `ready` (both have it, and the view is
 * known), so they arrive in one frame; once either is ready (`anyReady`),
 * the wait is at most HOLD_MS. A document's panes are held once, as it
 * opens: loading another of its chats later is that pane's own business.
 *
 * `noteId` is the open document; the start screen (null) is never held.
 */
export function usePaneReveal(noteId: number | null, ready: boolean, anyReady: boolean): boolean {
  const [revealedFor, setRevealedFor] = useState<number | null>(null);
  const revealed = noteId == null || revealedFor === noteId || ready;

  useEffect(() => {
    if (noteId != null && ready) setRevealedFor(noteId);
  }, [noteId, ready]);

  useEffect(() => {
    if (noteId == null || revealed || !anyReady) return;
    const timer = setTimeout(() => setRevealedFor(noteId), HOLD_MS);
    return () => clearTimeout(timer);
  }, [noteId, revealed, anyReady]);

  return revealed;
}
