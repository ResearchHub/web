'use client';

import type { ReactNode } from 'react';
import { PanelLeft } from 'lucide-react';
import { PublishMenu } from '@/app/layouts/PublishMenu';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import type { useResizableWidth } from '@/hooks/useResizableWidth';
import { cn } from '@/utils/styles';
import type { WorkspaceLayout } from '../workspaceUrl';

type ResizableWidth = ReturnType<typeof useResizableWidth>;

interface WorkspacePanesProps {
  readonly layout: WorkspaceLayout;
  readonly chat: ReactNode;
  /** The document column; null while no document is open. */
  readonly document: ReactNode | null;
  /** The document as the drawer shows it below the tablet breakpoint. */
  readonly documentDrawer: ReactNode | null;
  readonly isBelowTablet: boolean;
  readonly sideWidth: ResizableWidth & { readonly min: number; readonly max: number };
  /**
   * The conversations and drafts, for the widths at which the app's left
   * column has no room for them; null once it holds them.
   */
  readonly lists: ReactNode | null;
  /** Shows the lists: a panel over the panes, or below the tablet breakpoint the whole screen. */
  readonly listOpen: boolean;
  readonly onCloseList: () => void;
  readonly onCloseDocumentDrawer: () => void;
}

/**
 * The chat and the document, side by side. They keep their places in the
 * tree whichever is the main pane — swapping them would remount the editor
 * and the transcript — and trade places on screen with flex order. The side
 * pane drags; the main pane takes the rest. Below the tablet breakpoint the
 * document lives in a bottom drawer. Where the app's left column cannot hold
 * the lists they open over the panes.
 */
export function WorkspacePanes({
  layout,
  chat,
  document,
  documentDrawer,
  isBelowTablet,
  sideWidth,
  lists,
  listOpen,
  onCloseList,
  onCloseDocumentDrawer,
}: WorkspacePanesProps) {
  const documentOpen = document != null;
  // With no document beside it there is nothing to trade places with: the chat fills the space.
  const chatIsMain = layout === 'chat' || !documentOpen || isBelowTablet;
  const showLists = lists != null && listOpen;

  return (
    <>
      <div className="relative flex min-h-0 flex-1">
        <main
          style={chatIsMain ? undefined : { width: sideWidth.width }}
          className={cn(
            'relative flex min-w-0 flex-col',
            chatIsMain ? 'order-1 flex-1' : 'order-2 shrink-0 border-l border-gray-200'
          )}
        >
          {!chatIsMain && <SideResizeHandle label="Resize chat" width={sideWidth} />}
          {chat}
        </main>

        {documentOpen && !isBelowTablet && (
          <aside
            style={chatIsMain ? { width: sideWidth.width } : undefined}
            className={cn(
              'relative flex min-w-0 flex-col overflow-hidden bg-white',
              chatIsMain ? 'order-2 shrink-0 border-l border-gray-200' : 'order-1 flex-1'
            )}
          >
            {chatIsMain && <SideResizeHandle label="Resize document" width={sideWidth} />}
            {document}
          </aside>
        )}

        {showLists && isBelowTablet && (
          <div
            role="dialog"
            aria-label="Conversations and documents"
            className="absolute inset-0 z-10 flex flex-col bg-white"
          >
            <div className="flex h-12 shrink-0 items-center gap-1 border-b border-gray-200 pl-0.5 pr-3">
              <button
                type="button"
                onClick={onCloseList}
                aria-label="Hide conversations and documents"
                aria-pressed="true"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-primary-700"
              >
                <PanelLeft className="h-[18px] w-[18px]" />
              </button>
              <h2 className="text-sm font-medium text-gray-800">Conversations and documents</h2>
            </div>
            {/* A phone has no left column, so the way to start something new leads the lists. */}
            <div className="px-3 pt-3">
              <PublishMenu onItemSelected={onCloseList} />
            </div>
            <div className="min-h-0 flex-1">{lists}</div>
          </div>
        )}

        {/* Between the tablet breakpoint and the width at which the left
            column holds the lists, they slide over the panes from its edge.
            The strip's button, which stays clear of the scrim, also closes it. */}
        {showLists && !isBelowTablet && (
          <>
            <div
              aria-hidden="true"
              onClick={onCloseList}
              className="workspace-fade-in absolute inset-0 z-10 bg-gray-900/20"
            />
            <aside
              aria-label="Conversations and documents"
              className="workspace-fade-in absolute inset-y-0 left-0 z-20 flex w-[240px] flex-col border-r border-gray-200 bg-white pt-1 shadow-xl"
            >
              {lists}
            </aside>
          </>
        )}
      </div>

      <SwipeableDrawer
        isOpen={documentOpen && isBelowTablet}
        onClose={onCloseDocumentDrawer}
        height="85vh"
        className="tablet:!hidden"
      >
        {documentOpen && isBelowTablet && documentDrawer}
      </SwipeableDrawer>
    </>
  );
}

function SideResizeHandle({
  label,
  width,
}: {
  readonly label: string;
  readonly width: WorkspacePanesProps['sideWidth'];
}) {
  return (
    <ResizeHandle
      label={label}
      side="left"
      value={width.width}
      min={width.min}
      max={width.max}
      isResizing={width.isResizing}
      onStart={width.startResize}
      onNudge={width.nudgeWidth}
    />
  );
}
