'use client';

import type { ReactNode } from 'react';
import { PanelLeft } from 'lucide-react';
import { ResizeHandle } from '@/components/ui/ResizeHandle';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import type { useResizableWidth } from '@/hooks/useResizableWidth';
import { cn } from '@/utils/styles';
import type { WorkspaceLayout } from '../AIModeContext';

/** Above the overlay (9500), below BaseModal (9999). */
const AI_MODE_DRAWER_Z_INDEX = 9600;

type ResizableWidth = ReturnType<typeof useResizableWidth>;

interface WorkspacePanesProps {
  readonly layout: WorkspaceLayout;
  readonly sidebar: ReactNode;
  readonly chat: ReactNode;
  /** The document column; null while no document is open. */
  readonly document: ReactNode | null;
  /** The document as the drawer shows it below the tablet breakpoint. */
  readonly documentDrawer: ReactNode | null;
  readonly isBelowTablet: boolean;
  readonly sidebarWidth: ResizableWidth & { readonly min: number; readonly max: number };
  readonly sideWidth: ResizableWidth & { readonly min: number; readonly max: number };
  /** Below the tablet breakpoint the sidebar is a screen of its own; this shows it. */
  readonly listOpen: boolean;
  readonly onCloseList: () => void;
  readonly onCloseDocumentDrawer: () => void;
  /** The overlay's root, which the drawers render inside so they stay live. */
  readonly container: HTMLElement | null;
}

/**
 * The three columns: sidebar, chat, document. The chat and the document keep
 * their places in the tree whichever is the main pane — swapping them would
 * remount the editor and the transcript — and trade places on screen with
 * flex order. Both side panes drag; the main pane takes the rest. Below the
 * tablet breakpoint the sidebar takes the whole screen when asked for and
 * the document lives in a bottom drawer.
 */
export function WorkspacePanes({
  layout,
  sidebar,
  chat,
  document,
  documentDrawer,
  isBelowTablet,
  sidebarWidth,
  sideWidth,
  listOpen,
  onCloseList,
  onCloseDocumentDrawer,
  container,
}: WorkspacePanesProps) {
  const documentOpen = document != null;
  // With no document there is nothing to trade places with: the chat fills the space.
  const chatIsMain = layout === 'chat' || !documentOpen;

  return (
    <>
      <div className="relative flex min-h-0 flex-1">
        <aside
          style={{ width: sidebarWidth.width }}
          className="relative hidden shrink-0 flex-col border-r border-gray-200 bg-gray-100 tablet:!flex"
        >
          {sidebar}
          <ResizeHandle
            label="Resize conversations"
            side="right"
            value={sidebarWidth.width}
            min={sidebarWidth.min}
            max={sidebarWidth.max}
            isResizing={sidebarWidth.isResizing}
            onStart={sidebarWidth.startResize}
            onNudge={sidebarWidth.nudgeWidth}
          />
        </aside>

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

        {listOpen && isBelowTablet && (
          <div
            role="dialog"
            aria-label="Conversations and documents"
            className="absolute inset-0 z-10 flex flex-col bg-gray-100"
          >
            <div className="flex h-12 shrink-0 items-center gap-1 border-b border-gray-200 bg-white pl-0.5 pr-3">
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
            <div className="min-h-0 flex-1">{sidebar}</div>
          </div>
        )}
      </div>

      {/* The drawer portals to the body, so it needs to stack above this
          overlay (z-9500) while staying under BaseModal (9999). */}
      <SwipeableDrawer
        isOpen={documentOpen && isBelowTablet}
        onClose={onCloseDocumentDrawer}
        height="85vh"
        className="tablet:!hidden"
        zIndex={AI_MODE_DRAWER_Z_INDEX}
        container={container}
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
