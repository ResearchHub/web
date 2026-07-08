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

// Don't render pills that would sit under the fixed header or off-screen.
const TOP_BOUND = 72;
// Gap between the document's right edge and the review pill.
const MARGIN_GAP = 20;
// Approximate pill height; used to keep stacked pills from overlapping.
const PILL_HEIGHT = 40;

/**
 * Google-Docs-style suggestion review. For each pending suggested edit we
 * render a compact accept/reject pill out in the right margin (outside the
 * document paper) rather than floating it over the text — this keeps the copy
 * readable and lets the user freely edit the suggested text before deciding.
 * Bulk "accept/reject all" lives in the chat panel; these are the per-change
 * controls.
 */
export function SuggestionReview({ editor }: { editor: Editor }) {
  const [edits, setEdits] = useState<PositionedEdit[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const recompute = useCallback(() => {
    if (!editor || editor.isDestroyed) return;

    // Anchor the pills to the right edge of the document paper so they sit in
    // the gray margin, clamped to stay on-screen on narrower viewports.
    const paper = (editor.view.dom as HTMLElement).closest(
      '[data-tour="notebook-editor"]'
    ) as HTMLElement | null;
    const paperRight = paper?.getBoundingClientRect().right ?? editor.view.dom.getBoundingClientRect().right;
    const left = Math.min(paperRight + MARGIN_GAP, window.innerWidth - 96);

    const regions = findPendingEdits(editor);
    const positioned: PositionedEdit[] = [];
    let lastTop = -Infinity;
    regions
      .map((r) => ({ region: r, top: editor.view.coordsAtPos(r.from).top }))
      .filter((r) => r.top > TOP_BOUND && r.top < window.innerHeight - 10)
      .sort((a, b) => a.top - b.top)
      .forEach(({ region, top }) => {
        // Nudge overlapping pills down so each stays clickable.
        const resolvedTop = Math.max(top, lastTop + PILL_HEIGHT);
        lastTop = resolvedTop;
        positioned.push({
          key: `${region.from}-${region.to}`,
          from: region.from,
          to: region.to,
          top: resolvedTop,
          left,
        });
      });
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
          className="fixed z-50 flex items-center gap-0.5 rounded-full border border-gray-200 bg-white p-1 shadow-md"
          style={{ top: edit.top, left: edit.left }}
        >
          <button
            type="button"
            title="Accept this change"
            aria-label="Accept this change"
            onClick={() => {
              acceptEdit(editor, edit.from, edit.to);
              recompute();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-green-600 transition-colors hover:bg-green-50"
          >
            <Check className="h-4 w-4" />
          </button>
          <button
            type="button"
            title="Reject this change"
            aria-label="Reject this change"
            onClick={() => {
              rejectEdit(editor, edit.from, edit.to);
              recompute();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-full text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </>,
    document.body
  );
}
