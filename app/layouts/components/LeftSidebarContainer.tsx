'use client';

import { cn } from '@/lib/utils';
import { LeftSidebar } from '../LeftSidebar';

interface LeftSidebarContainerProps {
  isOpen: boolean;
  /** Closes the menu once something in it is picked; see `LeftSidebar`'s `onNavigate`. */
  onClose?: () => void;
}

/**
 * The app's left column from 1240px up. Narrower than that there is no
 * column: the top bar's menu button slides the whole sidebar in, over the
 * top bar and the page.
 */
export function LeftSidebarContainer({ isOpen, onClose }: LeftSidebarContainerProps) {
  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 flex-shrink-0 z-[130] w-[240px]',
        // The menu: fixed full height, sliding in over the top bar (and the promo banner).
        'fixed top-0 h-screen',
        'transition-transform duration-200 ease-out',
        isOpen ? '!translate-x-0' : '!-translate-x-full',
        // The column: in the page's row, always there.
        'sidebar-compact:!sticky sidebar-compact:!top-0 sidebar-compact:!h-screen sidebar-compact:!z-30',
        'sidebar-compact:!transition-none sidebar-compact:!translate-x-0'
      )}
    >
      <LeftSidebar onNavigate={onClose} />
    </div>
  );
}
