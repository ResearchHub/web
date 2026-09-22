'use client';

import { Sparkles, X } from 'lucide-react';
import { AI_MODE_NAME } from '../copy';

interface AIModeHeaderProps {
  /** The open document's title, shown beside its publish controls; null when none is open. */
  readonly documentTitle: string | null;
  /**
   * Receives the element the document pane renders its publish controls
   * into. Absent below the tablet breakpoint, where the drawer keeps them.
   */
  readonly publishControlsRef?: (element: HTMLDivElement | null) => void;
  readonly onClose: () => void;
}

/** The workspace's top strip: the name, the open document's publishing state, close. */
export function AIModeHeader({ documentTitle, publishControlsRef, onClose }: AIModeHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary-600" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight text-gray-900">{AI_MODE_NAME}</span>
      </div>
      <div className="flex min-w-0 items-center gap-3">
        {documentTitle != null && publishControlsRef && (
          <>
            <span className="hidden max-w-[260px] truncate text-xs text-gray-600 lg:!inline">
              {documentTitle}
            </span>
            <div ref={publishControlsRef} className="flex items-center" />
            <span aria-hidden="true" className="h-5 w-px bg-gray-200" />
          </>
        )}
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close ${AI_MODE_NAME}`}
          className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
