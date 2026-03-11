'use client';

import { Suspense } from 'react';
import dynamic from 'next/dynamic';

const TopBar = dynamic(() => import('../TopBar').then((mod) => mod.TopBar), {
  ssr: true,
});

const TopBarSkeleton = () => (
  <div className="h-16 w-full border-b border-gray-200 bg-gray-50 animate-pulse" />
);

interface TopBarContainerProps {
  isMobileTopNavHidden: boolean;
  isLeftSidebarOpen: boolean;
  onMenuClick: () => void;
}

export function TopBarContainer({
  isMobileTopNavHidden,
  isLeftSidebarOpen,
  onMenuClick,
}: TopBarContainerProps) {
  const shouldHide = isMobileTopNavHidden && !isLeftSidebarOpen;

  return (
    <div
      className={`fixed top-0 right-0 z-[60] tablet:!z-50 tablet:!bg-white
        left-0 tablet:!left-[240px] tablet:sidebar-compact:!left-[240px] tablet:max-sidebar-compact:!left-[70px]
        transition-transform duration-300 ease-in-out tablet:!transform-none
        ${shouldHide ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <Suspense fallback={<TopBarSkeleton />}>
        <TopBar onMenuClick={onMenuClick} />
      </Suspense>
    </div>
  );
}
