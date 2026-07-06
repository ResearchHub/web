'use client';

import { useCallback, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { Editor } from '@tiptap/core';
import { Check, X } from 'lucide-react';
import { acceptEdit, findPendingEdits, rejectEdit } from './suggestedEdits';

interface PositionedEdit {
  key: string;
  from: number;
  to: number;
  top: number;
  left: number;
}

// Don't render menus that would sit under the fixed header or off-screen.
const TOP_BOUND = 96;

/**
 * Renders a floating "approve / reject" control above each pending suggested
 * edit in the document (Google-Docs review style). Accepting turns the
 * suggested text into normal black copy; rejecting restores the original.
 */
export function SuggestionReview({ editor }: { editor: Editor }) {
  const [edits, setEdits] = useState<PositionedEdit[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const recompute = useCallback(() => {
    if (!editor || editor.isDestroyed) return;
    const regions = findPendingEdits(editor);
    const positioned = regions
      .map((r) => {
        const start = editor.view.coordsAtPos(r.from);
        return {
          key: `${r.from}-${r.to}`,
          from: r.from,
          to: r.to,
          top: start.top,
          left: start.left,
        };
      })
      .filter((p) => p.top > TOP_BOUND && p.top < window.innerHeight - 10);
    setEdits(positioned);
  }, [editor]);

  useEffect(() => {
    recompute();
    editor.on('update', recompute);
    // Capture-phase catches scrolling on the document pane's inner container.
    window.addEventListener('scroll', recompute, true);
    window.addEventListener('resize', recompute);
    return () => {
      editor.off('update', recompute);
      window.removeEventListener('scroll', recompute, true);
      window.removeEventListener('resize', recompute);
    };
  }, [editor, recompute]);

  if (!mounted) return null;

  return createPortal(
    <>
      {edits.map((edit) => (
        <div
          key={edit.key}
          className="fixed z-50 -translate-y-full"
          style={{ top: edit.top - 6, left: Math.max(12, edit.left) }}
        >
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 bg-white p-1 shadow-md">
            <button
              type="button"
              onClick={() => {
                acceptEdit(editor, edit.from, edit.to);
                recompute();
              }}
              className="flex h-6 items-center gap-1 rounded-md bg-green-50 px-2 text-xs font-medium text-green-700 transition-colors hover:bg-green-100"
            >
              <Check className="h-3.5 w-3.5" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => {
                rejectEdit(editor, edit.from, edit.to);
                recompute();
              }}
              className="flex h-6 items-center gap-1 rounded-md px-2 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </>,
    document.body
  );
}
