'use client';

import { useCallback, useMemo, useState } from 'react';

/** What the workspace shows of an open document: its chat, the two side by side, or the document. */
export type WorkspaceView = 'chat' | 'split' | 'document';

const VIEWS: readonly WorkspaceView[] = ['chat', 'split', 'document'];

/**
 * Each document's view, as `[noteId, view]` pairs, the most recently set
 * last. A list rather than an object, whose integer keys would lose that
 * order.
 */
const STORAGE_KEY = 'workspace:views';
/** Documents whose view is remembered; the longest untouched are forgotten first. */
const MAX_REMEMBERED = 100;

type RememberedViews = Array<[number, WorkspaceView]>;

function readViews(): RememberedViews {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (entry): entry is [number, WorkspaceView] =>
        Array.isArray(entry) &&
        typeof entry[0] === 'number' &&
        VIEWS.includes(entry[1] as WorkspaceView)
    );
  } catch {
    return [];
  }
}

function storedView(noteId: number): WorkspaceView | null {
  return readViews().find(([id]) => id === noteId)?.[1] ?? null;
}

/** Remember the view a document is shown in, for the next time it opens. */
export function rememberWorkspaceView(noteId: number, view: WorkspaceView): void {
  try {
    const views = readViews().filter(([id]) => id !== noteId);
    views.push([noteId, view]);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(views.slice(-MAX_REMEMBERED)));
  } catch {
    // Storage is unavailable: the choice holds until the page is left.
  }
}

/**
 * The open document's view: the one last chosen for it in this browser,
 * else the document alone when it has no chats (it is being written by
 * hand) and the chat beside it otherwise. `hasChats` is null while that is
 * not known; the third value says whether the view is settled, rather than
 * a guess that may change once it is.
 */
export function useWorkspaceView(
  noteId: number | null,
  hasChats: boolean | null
): readonly [WorkspaceView, (view: WorkspaceView) => void, boolean] {
  const [chosen, setChosen] = useState<{
    readonly noteId: number;
    readonly view: WorkspaceView;
  } | null>(null);
  const remembered = useMemo(() => {
    if (noteId == null) return null;
    if (chosen?.noteId === noteId) return chosen.view;
    return storedView(noteId);
  }, [noteId, chosen]);
  const view = remembered ?? (hasChats === false ? 'document' : 'split');
  const settled = noteId == null || remembered != null || hasChats != null;

  const setView = useCallback(
    (next: WorkspaceView) => {
      if (noteId == null) return;
      rememberWorkspaceView(noteId, next);
      setChosen({ noteId, view: next });
    },
    [noteId]
  );
  return [view, setView, settled];
}
