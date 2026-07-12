'use client';

import { EndowmentPromoBanner } from './EndowmentPromoBanner';
import { TopBar } from '../TopBar';

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
      data-top-bar-container
      className={`fixed top-0 right-0 z-[60] tablet:!z-50 tablet:!bg-white
        left-0 tablet:!left-[240px] tablet:sidebar-compact:!left-[240px] tablet:max-sidebar-compact:!left-[70px]
        transition-transform duration-300 ease-in-out tablet:!transform-none
        ${shouldHide ? '-translate-y-full' : 'translate-y-0'}`}
    >
      <EndowmentPromoBanner />
      <TopBar onMenuClick={onMenuClick} />
    </div>
  );
}
