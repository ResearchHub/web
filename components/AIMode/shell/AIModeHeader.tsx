'use client';

import { PanelLeft } from 'lucide-react';
import { cn } from '@/utils/styles';

interface AIModeHeaderProps {
  /**
   * What is open: the conversation's title when the chat is the main pane,
   * the document's when it is, "New RFP" or "New proposal" on the start screen.
   */
  readonly title: string;
  /** Receives the element the document pane renders its publish controls into. */
  readonly publishControlsRef?: (element: HTMLDivElement | null) => void;
  /**
   * Shows or hides the conversations and drafts while the app's left column
   * is an icon rail with no room for them; absent once the column holds them.
   */
  readonly onToggleList?: () => void;
  readonly listOpen?: boolean;
}

/**
 * The workspace's strip, under the app's top bar: what is open, and the open
 * document's publishing state. The way out is the top bar's back arrow.
 */
export function AIModeHeader({
  title,
  publishControlsRef,
  onToggleList,
  listOpen = false,
}: AIModeHeaderProps) {
  const listLabel = listOpen
    ? 'Hide conversations and documents'
    : 'Show conversations and documents';
  return (
    // The top bar's gutters, so the title sits under its back arrow and the
    // publish controls under its user controls.
    <header className="flex h-12 shrink-0 items-center justify-between gap-4 border-b border-gray-200 bg-white px-4 lg:px-8">
      <div className="flex min-w-0 items-center gap-2">
        {onToggleList && (
          <button
            type="button"
            onClick={onToggleList}
            aria-pressed={listOpen}
            aria-label={listLabel}
            title={listLabel}
            className={cn(
              'inline-flex shrink-0 items-center justify-center rounded-lg p-1.5 transition-colors sidebar-compact:!hidden',
              listOpen
                ? 'bg-primary-50 text-primary-700 hover:bg-primary-100'
                : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
            )}
          >
            <PanelLeft className="h-4 w-4" aria-hidden="true" />
          </button>
        )}
        <h1 className="min-w-0 truncate text-base font-semibold tracking-tight text-gray-900">
          {title}
        </h1>
      </div>
      {publishControlsRef && (
        <div ref={publishControlsRef} className="flex shrink-0 items-center" />
      )}
    </header>
  );
}
