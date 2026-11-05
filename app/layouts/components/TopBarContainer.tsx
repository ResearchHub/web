'use client';

import { cn } from '@/utils/styles';
import { TopBar } from '../TopBar';

interface TopBarContainerProps {
  isLeftSidebarOpen: boolean;
  onMenuClick: () => void;
}

export function TopBarContainer({ isLeftSidebarOpen, onMenuClick }: TopBarContainerProps) {
  return (
    <div
      data-top-bar-container
      className={cn(
        'fixed top-0 right-0 z-[60] tablet:!z-50 tablet:!bg-white',
        'left-0 sidebar-compact:!left-[240px]',
        'transition-transform duration-300 ease-in-out tablet:!transform-none translate-y-0',
        // On phones the bar slides away while PageLayout's shell is marked
        // data-top-bar-hidden, except with the menu open.
        !isLeftSidebarOpen && 'group-data-[top-bar-hidden]/shell:-translate-y-full'
      )}
    >
      <TopBar onMenuClick={onMenuClick} isMenuOpen={isLeftSidebarOpen} />
    </div>
  );
}
