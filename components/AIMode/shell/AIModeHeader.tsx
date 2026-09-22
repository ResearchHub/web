'use client';

import { FileText, MessageSquare, Sparkles, X } from 'lucide-react';
import { ButtonGroup } from '@/components/ui/ButtonGroup';
import type { WorkspaceLayout } from '../AIModeContext';
import { AI_MODE_NAME } from '../copy';

interface AIModeHeaderProps {
  /** The open document's title, shown beside its publish controls; null when none is open. */
  readonly documentTitle: string | null;
  /**
   * Receives the element the document pane renders its publish controls
   * into. Absent below the tablet breakpoint, where the drawer keeps them.
   */
  readonly publishControlsRef?: (element: HTMLDivElement | null) => void;
  /** Which pane is the main one; absent when there is nothing to swap. */
  readonly layout?: WorkspaceLayout;
  readonly onLayoutChange?: (layout: WorkspaceLayout) => void;
  readonly onClose: () => void;
}

/** The workspace's top strip: the name, the open document's publishing state, close. */
export function AIModeHeader({
  documentTitle,
  publishControlsRef,
  layout,
  onLayoutChange,
  onClose,
}: AIModeHeaderProps) {
  return (
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary-600" aria-hidden="true" />
        <span className="text-sm font-semibold tracking-tight text-gray-900">{AI_MODE_NAME}</span>
        {layout && onLayoutChange && (
          <ButtonGroup
            size="sm"
            className="ml-3 rounded-[9px]"
            value={layout}
            onChange={(next) => onLayoutChange(next as WorkspaceLayout)}
            options={[
              {
                value: 'chat',
                label: (
                  <>
                    <MessageSquare className="h-3.5 w-3.5" aria-hidden="true" />
                    Chat first
                  </>
                ),
              },
              {
                value: 'document',
                label: (
                  <>
                    <FileText className="h-3.5 w-3.5" aria-hidden="true" />
                    Document first
                  </>
                ),
              },
            ]}
          />
        )}
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
