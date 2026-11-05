'use client';

import { useRef, useState } from 'react';
import { SearchModal } from '@/components/Search/SearchModal';
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
  // The menu's Search: the menu steps aside and the search opens in its place,
  // once the menu is gone, so the focus it hands back to ☰ doesn't land after
  // the search box has taken it.
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchAfterClose = useRef(false);

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
          onAfterClose={() => {
            if (!searchAfterClose.current) return;
            searchAfterClose.current = false;
            setIsSearchOpen(true);
          }}
        >
          <LeftSidebar
            onNavigate={onClose}
            onSearch={() => {
              searchAfterClose.current = true;
              onClose();
            }}
          />
        </SidePanel>
      )}

      {onClose && <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />}
    </>
  );
}
