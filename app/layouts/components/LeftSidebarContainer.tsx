'use client';

import { SidePanel } from '@/components/ui/SidePanel';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { LeftSidebar } from '../LeftSidebar';

interface LeftSidebarContainerProps {
  isOpen: boolean;
  /**
   * Closes the menu, and once something in it is picked; see `LeftSidebar`'s
   * `onNavigate`. Without it there is no menu, only the column.
   */
  onClose?: () => void;
}

/**
 * The app's left column from 1240px up. Narrower than that there is no
 * column: the top bar's menu button slides the whole sidebar in from the left,
 * in the same panel the feed opens a review in.
 */
export function LeftSidebarContainer({ isOpen, onClose }: LeftSidebarContainerProps) {
  // Widening the window past the breakpoint swaps an open menu for the column.
  const hasColumn = useMediaQuery('(min-width: 1240px)');

  return (
    <>
      <div className="hidden sidebar-compact:!block sticky top-0 z-30 h-screen w-[240px] flex-shrink-0 border-r border-gray-200 bg-white">
        <LeftSidebar />
      </div>

      {onClose && (
        <SidePanel
          isOpen={isOpen && hasColumn === false}
          onClose={onClose}
          side="left"
          // A fifth wider than the column, so its rows are easier to tap.
          widthClassName="w-[288px] max-w-[85vw]"
        >
          <LeftSidebar onNavigate={onClose} />
        </SidePanel>
      )}
    </>
  );
}
