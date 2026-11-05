'use client';

import { Check, X } from 'lucide-react';

interface NoteReviewControlsProps {
  readonly changeCount: number;
  /** Keep the incoming version's side: deletes the struck ranges. */
  readonly onAccept: () => void;
  /** Keep the reader's side: deletes the inserted ranges. */
  readonly onReject: () => void;
}

/**
 * The floating controls for an in-note diff review: the unresolved change
 * count with a green check to accept and a red x to reject. Positioning is
 * the host's concern — render this inside whatever container floats it over
 * the document.
 */
export function NoteReviewControls({ changeCount, onAccept, onReject }: NoteReviewControlsProps) {
  return (
    <div className="pointer-events-auto flex max-w-full items-center gap-2.5 rounded-full border border-gray-200 bg-white/95 py-1.5 pl-4 pr-1.5 shadow-lg backdrop-blur">
      <p className="text-xs font-medium text-gray-700">
        {changeCount === 1 ? '1 assistant change' : `${changeCount} assistant changes`}
      </p>
      <div className="flex shrink-0 items-center gap-0.5">
        <button
          type="button"
          onClick={onAccept}
          title="Accept the assistant’s changes"
          className="rounded-md p-1 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
        >
          <Check className="h-5 w-5" aria-hidden="true" strokeWidth={2.5} />
          <span className="sr-only">Accept the assistant’s changes</span>
        </button>
        <button
          type="button"
          onClick={onReject}
          title="Reject the assistant’s changes"
          className="rounded-md p-1 text-red-600 transition-colors hover:bg-red-50 hover:text-red-700"
        >
          <X className="h-5 w-5" aria-hidden="true" strokeWidth={2.5} />
          <span className="sr-only">Reject the assistant’s changes</span>
        </button>
      </div>
    </div>
  );
}
