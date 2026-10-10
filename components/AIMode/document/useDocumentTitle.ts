'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import type { Editor } from '@tiptap/react';
import { setDocumentTitle } from '@/components/Editor/lib/utils/documentTitle';
import type { NoteDetailsUpdate } from '@/types/note';
import { leadingTitleNode, MAX_TITLE_LENGTH, titleOf } from './masthead/title';

interface UseDocumentTitleOptions {
  /** This note's editor; null until it is up. */
  readonly editor: Editor | null;
  /** The note's saved title. */
  readonly savedTitle: string;
  /** Shows a new saved title at once (the sidebar, the top bar's fallback). */
  readonly showSavedTitle: (title: string) => void;
  /** Reports the heading as it changes, for the top bar. */
  readonly reportHeading: (title: string | null) => void;
  readonly saveDetailsSoon: (details: NoteDetailsUpdate) => void;
  readonly saveNoteNow: (editor: Editor) => Promise<boolean>;
  /** The assistant has the document: nothing is written into it. */
  readonly locked: boolean;
  /** The assistant's changes await a decision: the editor holds both versions. */
  readonly reviewing: boolean;
}

export interface DocumentTitle {
  /** What the document is published under: its heading, or '' when it has none. */
  readonly title: string;
  /**
   * Brings the note's saved title in line with the heading, if they differ.
   * For accepting the assistant's changes; never just for opening a document.
   */
  readonly syncSavedTitle: () => void;
  /**
   * The same, for after a save of the user's edits. A save during a review
   * is skipped: the heading may hold both versions until the decision.
   */
  readonly syncAfterSave: () => void;
  /**
   * Gives the document a title from outside it (the publish dialog): written
   * into the heading, one added at the top when there is none, then saved.
   */
  readonly writeTitle: (title: string) => void;
}

/**
 * The document's one title, which is its first heading (see `./masthead/title`).
 * It is edited in the document like any text; this keeps everything else in
 * step with it:
 *
 * - the top bar, as it is typed (display only, no request);
 * - the note's saved title, at moments the user acts, and only with a
 *   request when the two differ (the details writer folds a run of
 *   keystrokes into one);
 * - the publish dialog, which reads `title` and writes through `writeTitle`.
 */
export function useDocumentTitle({
  editor,
  savedTitle,
  showSavedTitle,
  reportHeading,
  saveDetailsSoon,
  saveNoteNow,
  locked,
  reviewing,
}: UseDocumentTitleOptions): DocumentTitle {
  // The heading as the editor has it, read on every change.
  const [heading, setHeading] = useState<string | null>(null);
  useEffect(() => {
    if (!editor || editor.isDestroyed) {
      setHeading(null);
      return undefined;
    }
    const read = () => setHeading(titleOf(editor.state.doc));
    read();
    editor.on('update', read);
    return () => {
      editor.off('update', read);
    };
  }, [editor]);

  // Only once the editor is up: until then the title the note loaded with stands.
  useEffect(() => {
    if (editor) reportHeading(heading);
  }, [editor, heading, reportHeading]);

  // Read at call time: a save calls in from outside React's render.
  const latest = useRef({ editor, savedTitle, reviewing });
  latest.current = { editor, savedTitle, reviewing };

  const syncSavedTitle = useCallback(() => {
    const { editor: current, savedTitle: saved } = latest.current;
    if (!current || current.isDestroyed) return;
    const next = titleOf(current.state.doc)?.slice(0, MAX_TITLE_LENGTH);
    if (!next || next === saved) return;
    showSavedTitle(next);
    saveDetailsSoon({ title: next });
  }, [showSavedTitle, saveDetailsSoon]);

  const syncAfterSave = useCallback(() => {
    if (!latest.current.reviewing) syncSavedTitle();
  }, [syncSavedTitle]);

  const writeTitle = useCallback(
    (next: string) => {
      if (!editor || editor.isDestroyed || locked || reviewing) {
        showSavedTitle(next);
        saveDetailsSoon({ title: next });
        return;
      }
      if (leadingTitleNode(editor.state.doc)) {
        setDocumentTitle(editor, next);
      } else {
        editor
          .chain()
          .insertContentAt(0, {
            type: 'heading',
            attrs: { level: 1 },
            content: [{ type: 'text', text: next }],
          })
          .run();
      }
      // The document goes out first and the title once it has landed: the
      // API takes them on separate routes, and a title arriving while a
      // version is written leaves the note pointing at the version before it.
      void saveNoteNow(editor).finally(syncSavedTitle);
    },
    [editor, locked, reviewing, showSavedTitle, saveDetailsSoon, saveNoteNow, syncSavedTitle]
  );

  return {
    // The saved title stands in only until the editor is up.
    title: editor ? (heading ?? '') : savedTitle,
    syncSavedTitle,
    syncAfterSave,
    writeTitle,
  };
}
