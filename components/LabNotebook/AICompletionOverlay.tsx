'use client';

import { useEffect, useRef, useCallback } from 'react';
import { Editor } from '@tiptap/react';
import { useAICompletion } from '@/hooks/useAICompletion';
import { debounce } from 'lodash';

interface AICompletionOverlayProps {
  editor: Editor | null;
  noteId: number;
}

const DEBOUNCE_DELAY = 1000; // 1 second
const CONTEXT_LENGTH = 200; // Characters before cursor

export function AICompletionOverlay({ editor, noteId }: AICompletionOverlayProps) {
  const { getCompletion, completion, isLoading, error, accept, reject } = useAICompletion(noteId);
  const lastContextRef = useRef<string>('');

  // Debounced completion fetcher
  const debouncedGetCompletion = useRef(
    debounce(async (context: string, pos: number) => {
      // Don't fetch if context hasn't changed
      if (context === lastContextRef.current) return;
      lastContextRef.current = context;

      // Don't fetch if context is too short
      if (context.length < 10) return;

      await getCompletion(context, pos);
    }, DEBOUNCE_DELAY)
  ).current;

  // Extract context from editor
  const extractContext = useCallback(() => {
    if (!editor) return null;

    const { state } = editor;
    const { selection } = state;
    const cursorPos = selection.anchor;

    // Get text before cursor
    const textBeforeCursor = state.doc.textBetween(
      Math.max(0, cursorPos - CONTEXT_LENGTH),
      cursorPos,
      ' '
    );

    return { context: textBeforeCursor, pos: cursorPos };
  }, [editor]);

  // Handle editor updates
  useEffect(() => {
    if (!editor) return;

    const handleUpdate = () => {
      const data = extractContext();
      if (data) {
        debouncedGetCompletion(data.context, data.pos);
      }
    };

    editor.on('update', handleUpdate);
    editor.on('selectionUpdate', handleUpdate);

    return () => {
      editor.off('update', handleUpdate);
      editor.off('selectionUpdate', handleUpdate);
      debouncedGetCompletion.cancel();
    };
  }, [editor, debouncedGetCompletion, extractContext]);

  // Update TipTap extension with completion
  useEffect(() => {
    if (!editor || !completion) return;

    const data = extractContext();
    if (data) {
      editor.commands.setAICompletion(completion, data.pos);
    }
  }, [editor, completion, extractContext]);

  // Handle accept/reject callbacks
  useEffect(() => {
    if (!editor) return;

    const extension = editor.extensionManager.extensions.find((ext) => ext.name === 'aiCompletion');
    if (extension) {
      extension.options.onAccept = accept;
      extension.options.onReject = reject;
    }
  }, [editor, accept, reject]);

  // Clear completion on error
  useEffect(() => {
    if (error && editor) {
      editor.commands.clearAICompletion();
    }
  }, [error, editor]);

  // This component doesn't render anything - it's purely behavioral
  return null;
}
