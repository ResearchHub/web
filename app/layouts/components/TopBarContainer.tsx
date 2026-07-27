'use client';

import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { EndowmentPromoBanner } from './EndowmentPromoBanner';
import { TopBar } from '../TopBar';

interface TopBarContainerProps {
  isMobileTopNavHidden: boolean;
  isLeftSidebarOpen: boolean;
  onMenuClick: () => void;
  /** When the page hides the left sidebar, stretch the bar to the viewport edge. */
  fullWidth?: boolean;
  /** Blend the bar into the page banner (gray background, no bottom border). */
  blendWithBanner?: boolean;
  /** Node rendered at the leading edge of the top bar, in place of the breadcrumb. */
  leftSlot?: ReactNode;
  /** Node rendered centered in the top bar (e.g. page tabs). */
  centerSlot?: ReactNode;
  /** Node rendered at the leading edge of the right-side controls. */
  rightSlot?: ReactNode;
  /** Minimal mobile chrome: only logo + centered title on mobile. */
  minimalMobile?: boolean;
}

export function TopBarContainer({
  isMobileTopNavHidden,
  isLeftSidebarOpen,
  onMenuClick,
  fullWidth = false,
  blendWithBanner = false,
  leftSlot,
  centerSlot,
  rightSlot,
  minimalMobile = false,
}: TopBarContainerProps) {
  const shouldHide = isMobileTopNavHidden && !isLeftSidebarOpen;

  return (
    <div
      data-top-bar-container
      className={cn(
        'fixed top-0 right-0 z-[60] tablet:!z-50 left-0',
        blendWithBanner ? 'tablet:!bg-gray-50/80' : 'tablet:!bg-white',
        !fullWidth &&
          'tablet:!left-[240px] tablet:sidebar-compact:!left-[240px] tablet:max-sidebar-compact:!left-[70px]',
        'transition-transform duration-300 ease-in-out tablet:!transform-none',
        shouldHide ? '-translate-y-full' : 'translate-y-0'
      )}
    >
      <EndowmentPromoBanner />
      <TopBar
        onMenuClick={onMenuClick}
        blendWithBanner={blendWithBanner}
        leftSlot={leftSlot}
        centerSlot={centerSlot}
        rightSlot={rightSlot}
        minimalMobile={minimalMobile}
        showDesktopLogo={fullWidth}
      />
    </div>
  );
}
