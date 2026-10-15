'use client';

import { useEffect, useState } from 'react';
import type { WorkspaceView } from './workspaceView';

/** How long a pane that has loaded waits for the other before it shows on its own. */
const HOLD_MS = 400;

interface PaneRevealOptions {
  /** The open document; the start screen (null) is never held. */
  readonly noteId: number | null;
  /** What shows of the two, as the panes show it. */
  readonly view: WorkspaceView;
  /** There is a document pane at all. */
  readonly hasDocument: boolean;
  /** The view is the document's own, not a guess that may change once its chats load. */
  readonly settled: boolean;
  /** The chat has something of its own to show. */
  readonly chatReady: boolean;
}

export interface PaneReveal {
  /** The panes may show what they have loaded. */
  readonly revealed: boolean;
  /** The document pane reports the note it has ready to show, or null while it has none. */
  readonly setDocumentReady: (noteId: number | null) => void;
}

/**
 * Whether the open document's panes may show what they have loaded. Those
 * in view are held on their skeletons until each has it and the view is
 * settled, so they arrive in one frame; once either is ready, the wait is at
 * most HOLD_MS. A document's panes are held once, as it opens: loading
 * another of its chats later is that pane's own business.
 */
export function usePaneReveal({
  noteId,
  view,
  hasDocument,
  settled,
  chatReady,
}: PaneRevealOptions): PaneReveal {
  const [documentReadyFor, setDocumentReady] = useState<number | null>(null);
  const [revealedFor, setRevealedFor] = useState<number | null>(null);

  const chatShown = !hasDocument || view !== 'document';
  const documentShown = hasDocument && view !== 'chat';
  const documentReady = noteId != null && documentReadyFor === noteId;
  const ready = settled && (!chatShown || chatReady) && (!documentShown || documentReady);
  const anyReady = (chatShown && chatReady) || (documentShown && documentReady);
  const revealed = noteId == null || revealedFor === noteId || ready;

  useEffect(() => {
    if (noteId != null && ready) setRevealedFor(noteId);
  }, [noteId, ready]);

  useEffect(() => {
    if (noteId == null || revealed || !anyReady) return;
    const timer = setTimeout(() => setRevealedFor(noteId), HOLD_MS);
    return () => clearTimeout(timer);
  }, [noteId, revealed, anyReady]);

  return { revealed, setDocumentReady };
}
