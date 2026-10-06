'use client';

import type { ReactNode } from 'react';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import type { useResizableWidth } from '@/hooks/useResizableWidth';

type ResizableWidth = ReturnType<typeof useResizableWidth>;

interface WorkspacePanesProps {
  readonly chat: ReactNode;
  /** The document column; null while no document is open or it is hidden. */
  readonly document: ReactNode | null;
  /** The document as the drawer shows it below the tablet breakpoint. */
  readonly documentDrawer: ReactNode | null;
  readonly isBelowTablet: boolean;
  readonly documentWidth: ResizableWidth & { readonly min: number; readonly max: number };
  /**
   * The user's documents, for the widths at which the app's left column is an
   * icon rail, or absent on a phone; null when they are in it.
   */
  readonly documents: ReactNode | null;
  /** Shows the documents in a panel over the panes. */
  readonly documentsOpen: boolean;
  readonly onCloseDocuments: () => void;
  readonly onCloseDocumentDrawer: () => void;
}

/**
 * The chat, and the document beside it on the right. The document's column
 * drags; the chat takes the rest. Below the tablet breakpoint the document
 * lives in a bottom drawer. Where the app's left column is an icon rail, the
 * user's documents open over the panes.
 */
export function WorkspacePanes({
  chat,
  document,
  documentDrawer,
  isBelowTablet,
  documentWidth,
  documents,
  documentsOpen,
  onCloseDocuments,
  onCloseDocumentDrawer,
}: WorkspacePanesProps) {
  const documentShown = document != null;

  return (
    <>
      <div className="relative flex min-h-0 flex-1">
        <main className="relative flex min-w-0 flex-1 flex-col">{chat}</main>

        {documentShown && !isBelowTablet && (
          <aside
            style={{ width: documentWidth.width }}
            className="relative flex min-w-0 shrink-0 flex-col overflow-hidden border-l border-gray-200 bg-white"
          >
            <ResizeHandle
              label="Resize document"
              side="left"
              value={documentWidth.width}
              min={documentWidth.min}
              max={documentWidth.max}
              isResizing={documentWidth.isResizing}
              onStart={documentWidth.startResize}
              onNudge={documentWidth.nudgeWidth}
            />
            {document}
          </aside>
        )}

        {/* Below the width at which the left column holds them, the
            documents slide over the panes from its edge. */}
        {documents != null && documentsOpen && (
          <>
            <div
              aria-hidden="true"
              onClick={onCloseDocuments}
              className="workspace-fade-in absolute inset-0 z-10 bg-gray-900/20"
            />
            <aside
              aria-label="Your documents"
              className="workspace-fade-in absolute inset-y-0 left-0 z-20 flex w-[240px] flex-col overflow-y-auto border-r border-gray-200 bg-white shadow-xl"
            >
              {documents}
            </aside>
          </>
        )}
      </div>

      <SwipeableDrawer
        isOpen={documentShown && isBelowTablet}
        onClose={onCloseDocumentDrawer}
        height="85vh"
        className="tablet:!hidden"
      >
        {documentShown && isBelowTablet && documentDrawer}
      </SwipeableDrawer>
    </>
  );
}
