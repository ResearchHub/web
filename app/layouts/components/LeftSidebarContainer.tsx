'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const LeftSidebar = dynamic(() => import('../LeftSidebar').then((mod) => mod.LeftSidebar), {
  ssr: true,
  loading: () => <LeftSidebarSkeleton />,
});

function LeftSidebarSkeleton() {
  return (
    <div className="h-full flex flex-col bg-white animate-pulse">
      <div className="p-4 pt-[10px]">
        <div className="h-[38px] w-[38px] ml-1 bg-gray-200 rounded" />
      </div>

      <div className="px-4 mt-6">
        <div className="h-11 w-full bg-gray-200 rounded-lg" />
      </div>

      <div className="flex-1 mt-2 overflow-hidden px-4 py-4 space-y-1.5">
        {Array.from({ length: 5 }, (_, i) => (
          <div key={i} className="flex items-center w-full px-5 py-3.5 rounded-lg">
            <div className="h-[26px] w-[26px] bg-gray-200 rounded flex-shrink-0 mr-4" />
            <div className="h-4 bg-gray-200 rounded" style={{ width: `${56 + (i % 3) * 16}px` }} />
          </div>
        ))}
      </div>

      <div className="px-4 py-6 border-t border-gray-200">
        <div className="flex items-center space-x-4 mb-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-5 w-5 bg-gray-200 rounded" />
          ))}
        </div>
        <div className="space-y-2">
          <div className="h-3 w-24 bg-gray-200 rounded" />
          <div className="h-3 w-32 bg-gray-200 rounded" />
        </div>
      </div>
    </div>
  );
}

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
      <Suspense fallback={<LeftSidebarSkeleton />}>
        <LeftSidebar />
      </Suspense>
    </div>
  );
}
