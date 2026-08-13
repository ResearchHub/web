'use client';

import { cn } from '@/lib/utils';
import { LeftSidebar } from '../LeftSidebar';

interface LeftSidebarContainerProps {
  isOpen: boolean;
}

export function LeftSidebarContainer({ isOpen }: LeftSidebarContainerProps) {
  return (
    <div
      className={cn(
        // Shared base styles
        'bg-white border-r border-gray-200 flex-shrink-0 z-50',
        'transition-all duration-300 ease-in-out',
        // Desktop: sticky, no transform transition
        'tablet:!sticky tablet:!top-0 tablet:!h-screen tablet:!z-30',
        'tablet:!transition-none tablet:!translate-x-0',
        'tablet:sidebar-compact:!w-[240px] tablet:max-sidebar-compact:!w-[70px]',
        'tablet:!block tablet:!w-[240px]',
        // Mobile: fixed, slides in/out below the constant-height top bar
        'fixed top-[var(--top-bar-height)] h-[calc(100vh-var(--top-bar-height))] duration-150 w-[240px]',
        isOpen ? '!translate-x-0' : '!-translate-x-full'
      )}
    >
      <LeftSidebar />
    </div>
  );
}
