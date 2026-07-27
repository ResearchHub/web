'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useMobileNavScroll } from '@/hooks/useMobileNavScroll';
import { cn } from '@/lib/utils';
import { ScrollContainerProvider } from '@/contexts/ScrollContainerContext';
import { GrantProvider } from '@/contexts/GrantContext';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FeedTabsVisibilityProvider } from '@/contexts/FeedTabsVisibilityContext';
import { TopBarSlotProvider } from '@/contexts/TopBarSlotContext';
import { useDismissableFeature } from '@/hooks/useDismissableFeature';
import { usePageLayoutState } from './hooks/usePageLayoutState';
import { TopBarContainer } from './components/TopBarContainer';
import { MobileOverlay } from './components/MobileOverlay';
import { LeftSidebarContainer } from './components/LeftSidebarContainer';
import { RightSidebarContainer } from './components/RightSidebarContainer';

const ENDOWMENT_PROMO_BANNER = 'endowment_promo_banner';

const MobileBottomNav = dynamic(
  () => import('./MobileBottomNav').then((mod) => mod.MobileBottomNav),
  { ssr: false }
);

interface PageLayoutProps {
  children: ReactNode;
  rightSidebar?: boolean | ReactNode;
  className?: string;
  sidebarContentClassName?: string;
  topBanner?: ReactNode;
  fundraiseGrantId?: number;
  /**
   * Drop the 660px main-content cap and let content fill the page container
   * (~1180px). Useful when `rightSidebar` is false and the page wants the
   * extra horizontal space.
   */
  wideContent?: boolean;
  /** Hide the left navigation sidebar entirely (used by condensed layouts). */
  hideLeftSidebar?: boolean;
  /** Replace the app navigation in the left sidebar with the page's own nav. */
  leftSidebar?: ReactNode;
  /** Blend the top bar into the page banner (gray background, no border). */
  blendTopBar?: boolean;
  /** Node rendered at the leading edge of the top bar (e.g. the page title). */
  topBarLeftSlot?: ReactNode;
  /** Node rendered centered in the top bar (e.g. page tabs). */
  topBarCenterSlot?: ReactNode;
  /** Node rendered at the leading edge of the top bar's right controls. */
  topBarRightSlot?: ReactNode;
  /** Minimal mobile top bar: only logo + centered title (no search/avatar). */
  topBarMinimalMobile?: boolean;
}

function PageLayoutInner({
  children,
  rightSidebar = true,
  className,
  sidebarContentClassName,
  topBanner,
  wideContent = false,
  hideLeftSidebar = false,
  leftSidebar,
  blendTopBar = false,
  topBarLeftSlot,
  topBarCenterSlot,
  topBarRightSlot,
  topBarMinimalMobile = false,
}: PageLayoutProps) {
  const {
    scrollContainerRef,
    isLeftSidebarOpen,
    isCompact,
    showOverlay,
    overlayVisible,
    toggleLeftSidebar,
    closeLeftSidebar,
  } = usePageLayoutState();

  const { isHidden: isMobileTopNavHidden } = useMobileNavScroll({ scrollContainerRef });

  // Pages on the default measure get a row that is exactly as wide as the
  // capped content (660px + the main padding) plus the sidebar (288px), so the
  // sidebar sits directly beside the content instead of being pushed to the far
  // edge. Pages that opt out of the cap — `wideContent`, or a `className` that
  // rewrites the max width — keep the roomier container.
  const managesOwnContentWidth = wideContent || Boolean(className);
  const rowMaxWidthClass = managesOwnContentWidth
    ? 'max-w-[1180px]'
    : rightSidebar
      ? 'max-w-[1012px]'
      : 'max-w-[724px]';

  // Mirror the EndowmentPromoBanner's visibility so we can reserve space for it
  // on mobile while it's shown above the TopBar. The banner itself only renders
  // below the tablet breakpoint, so the extra padding is also mobile-only.
  const { isDismissed: isPromoDismissed, dismissStatus: promoDismissStatus } =
    useDismissableFeature(ENDOWMENT_PROMO_BANNER);
  const isPromoBannerVisible = promoDismissStatus === 'checked' && !isPromoDismissed;

  return (
    <ScrollContainerProvider
      scrollContainerRef={scrollContainerRef}
      isMobileTopNavHidden={isMobileTopNavHidden}
    >
      <div className="flex h-screen">
        <TopBarContainer
          isMobileTopNavHidden={isMobileTopNavHidden}
          isLeftSidebarOpen={isLeftSidebarOpen}
          onMenuClick={toggleLeftSidebar}
          fullWidth={hideLeftSidebar}
          blendWithBanner={blendTopBar}
          leftSlot={topBarLeftSlot}
          centerSlot={topBarCenterSlot}
          rightSlot={topBarRightSlot}
          minimalMobile={topBarMinimalMobile}
        />

        {!hideLeftSidebar && (
          <>
            <MobileOverlay show={showOverlay} visible={overlayVisible} onClose={closeLeftSidebar} />
            <LeftSidebarContainer
              isOpen={isLeftSidebarOpen}
              isCompact={isCompact}
              content={leftSidebar}
            />
          </>
        )}

        {/* Scrollable content area.
            When the EndowmentPromoBanner is visible above the TopBar on mobile
            we add ~56px to the existing top padding to clear the extra strip.
            The banner itself is hidden at >= 768px (tablet:!hidden) so the
            offset is reset by the inner media query below.
            Bottom padding on mobile clears the fixed MobileBottomNav. */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden relative transition-all duration-150',
            'page-layout-with-mobile-bottom-nav',
            isCompact ? 'pt-12' : 'pt-16',
            isPromoBannerVisible && 'page-layout-with-promo-banner'
          )}
        >
          {topBanner && <div className="w-full">{topBanner}</div>}

          <div className={cn('flex mx-auto w-full', rowMaxWidthClass)}>
            <main
              className={cn(
                'flex-1 min-w-0 px-4 tablet:!px-8 pb-4',
                topBanner ? 'py-3 sm:py-6' : 'py-6 mt-4'
              )}
            >
              <div
                className={cn(
                  'w-full max-w-full',
                  !wideContent && 'tablet:!max-w-[660px]',
                  className
                )}
              >
                {children}
              </div>
            </main>

            {rightSidebar && (
              <RightSidebarContainer
                rightSidebar={rightSidebar}
                isCompact={isCompact}
                contentClassName={sidebarContentClassName}
              />
            )}
          </div>

          <MobileBottomNav />
        </div>
      </div>
    </ScrollContainerProvider>
  );
}

export function PageLayout({ fundraiseGrantId, ...props }: PageLayoutProps) {
  return (
    <GrantProvider>
      <FundraiseProvider grantId={fundraiseGrantId}>
        <FeedTabsVisibilityProvider>
          <TopBarSlotProvider>
            <PageLayoutInner {...props} />
          </TopBarSlotProvider>
        </FeedTabsVisibilityProvider>
      </FundraiseProvider>
    </GrantProvider>
  );
}
