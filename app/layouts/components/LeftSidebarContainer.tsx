'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const LeftSidebar = dynamic(() => import('../LeftSidebar').then((mod) => mod.LeftSidebar), {
  ssr: true,
  loading: () => <div className="w-full h-screen bg-gray-100 animate-pulse" />,
});

interface LeftSidebarContainerProps {
  isOpen: boolean;
  isCompact: boolean;
}

export function LeftSidebarContainer({ isOpen, isCompact }: LeftSidebarContainerProps) {
  const topOffset = isCompact ? 'top-[48px]' : 'top-[64px]';
  const heightOffset = isCompact ? 'h-[calc(100vh-48px)]' : 'h-[calc(100vh-64px)]';

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
        // Mobile: fixed, slides in/out
        'fixed duration-150 w-[240px]',
        topOffset,
        heightOffset,
        isOpen ? '!translate-x-0' : '!-translate-x-full'
      )}
    >
      <Suspense fallback={<div className="w-full h-screen bg-gray-100 animate-pulse" />}>
        <LeftSidebar />
      </Suspense>
    </div>
  );
}
