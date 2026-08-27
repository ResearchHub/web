'use client';

import { useEffect, useState } from 'react';
import type { Editor } from '@tiptap/core';

const readIsEmpty = (editor: Editor | null): boolean =>
  !editor || editor.isDestroyed ? true : editor.isEmpty;

/**
 * Whether the editor's document is empty, kept current as the document
 * changes.
 *
 * Subscribed to `transaction` rather than `update`: content applied
 * programmatically — loading a note, applying an assistant version — is sent
 * with `emitUpdate: false` so it doesn't trip the autosave, and so never
 * reaches an `update` listener. Only an actual flip re-renders the caller;
 * every other transaction just reads a cheap flag.
 *
 * No editor reads as empty: callers use this to choose between offering to
 * write a draft and offering to improve one, and with no document mounted
 * there is nothing to improve.
 */
export function useEditorIsEmpty(editor: Editor | null): boolean {
  const [isEmpty, setIsEmpty] = useState(() => readIsEmpty(editor));

  useEffect(() => {
    const sync = () => setIsEmpty(readIsEmpty(editor));
    sync();
    if (!editor) return;
    editor.on('transaction', sync);
    return () => {
      editor.off('transaction', sync);
    };
  }, [editor]);

  return isEmpty;
}
