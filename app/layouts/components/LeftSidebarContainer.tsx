'use client';

import { cn } from '@/lib/utils';
import { LeftSidebar } from '../LeftSidebar';

interface LeftSidebarContainerProps {
  isOpen: boolean;
  /** Closes the menu once something in it is picked; see `LeftSidebar`'s `onNavigate`. */
  onClose?: () => void;
  /** The phone's promo banner sits above the top bar, so the menu starts lower. */
  withPromoBanner?: boolean;
}

/**
 * The app's left column from 1240px up. Narrower than that there is no
 * column: the top bar's menu button slides the whole sidebar in, under the
 * top bar, over the page.
 */
export function LeftSidebarContainer({
  isOpen,
  onClose,
  withPromoBanner = false,
}: LeftSidebarContainerProps) {
  return (
    <div
      className={cn(
        'bg-white border-r border-gray-200 flex-shrink-0 z-50 w-[240px]',
        // The menu: fixed under the constant-height top bar, sliding in and out.
        'fixed top-[var(--top-bar-height)] h-[calc(100vh-var(--top-bar-height))]',
        withPromoBanner && 'left-sidebar-with-promo-banner',
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
