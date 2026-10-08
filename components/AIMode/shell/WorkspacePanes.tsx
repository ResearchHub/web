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
  readonly onCloseDocumentDrawer: () => void;
}

/**
 * The chat, and the document beside it on the right. The document's column
 * drags; the chat takes the rest. Below the tablet breakpoint the document
 * lives in a bottom drawer.
 */
export function WorkspacePanes({
  chat,
  document,
  documentDrawer,
  isBelowTablet,
  documentWidth,
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
