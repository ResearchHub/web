'use client';

import type { ReactNode } from 'react';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import type { useResizableWidth } from '@/hooks/useResizableWidth';
import { cn } from '@/utils/styles';
import type { WorkspaceView } from './workspaceView';

type ResizableWidth = ReturnType<typeof useResizableWidth>;

interface WorkspacePanesProps {
  readonly chat: ReactNode;
  /** The document; null on the start screen and while none can be shown. */
  readonly document: ReactNode | null;
  /** What shows of the two. On a phone, never `split`. Without a document, the chat. */
  readonly view: WorkspaceView;
  readonly documentWidth: ResizableWidth & { readonly min: number; readonly max: number };
}

/**
 * The chat, the document, or the two side by side with the document on the
 * right, where its column drags and the chat takes the rest. The document
 * stays mounted in every view, hidden in Chat: switching views never reloads
 * its editor, the assistant's changes wait in it to be reviewed, and its
 * publish dialog can open over the chat.
 */
export function WorkspacePanes({ chat, document, view, documentWidth }: WorkspacePanesProps) {
  const hasDocument = document != null;
  const showDocument = hasDocument && view !== 'chat';
  const showChat = !showDocument || view === 'split';
  const split = showChat && showDocument;

  return (
    <div className="relative flex min-h-0 flex-1">
      {showChat && <main className="relative flex min-w-0 flex-1 flex-col">{chat}</main>}

      {hasDocument && (
        <aside
          style={split ? { width: documentWidth.width } : undefined}
          className={cn(
            'relative flex min-w-0 flex-col overflow-hidden bg-white',
            split ? 'shrink-0 border-l border-gray-200' : 'flex-1',
            !showDocument && 'hidden'
          )}
        >
          {split && (
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
          )}
          {document}
        </aside>
      )}
    </div>
  );
}
