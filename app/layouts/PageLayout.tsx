'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useMobileNavScroll } from '@/hooks/useMobileNavScroll';
import { cn } from '@/lib/utils';
import { ScrollContainerProvider } from '@/contexts/ScrollContainerContext';
import { GrantProvider } from '@/contexts/GrantContext';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FeedTabsVisibilityProvider } from '@/contexts/FeedTabsVisibilityContext';
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
  /**
   * Drop the 860px main-content cap and let content fill the page container
   * (~1180px). Useful when `rightSidebar` is false and the page wants the
   * extra horizontal space.
   */
  wideContent?: boolean;
}

function PageLayoutInner({
  children,
  rightSidebar = true,
  className,
  sidebarContentClassName,
  topBanner,
  wideContent = false,
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
        />

        <MobileOverlay show={showOverlay} visible={overlayVisible} onClose={closeLeftSidebar} />

        <LeftSidebarContainer isOpen={isLeftSidebarOpen} isCompact={isCompact} />

        {/* Scrollable content area.
            When the EndowmentPromoBanner is visible above the TopBar on mobile
            we add ~56px to the existing top padding to clear the extra strip.
            The banner itself is hidden at >= 768px (tablet:!hidden) so the
            offset is reset by the inner media query below. */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden relative transition-all duration-150',
            isCompact ? 'pt-12' : 'pt-16',
            isPromoBannerVisible && 'page-layout-with-promo-banner'
          )}
        >
          {topBanner && <div className="w-full">{topBanner}</div>}

          <div className="flex mx-auto w-full max-w-[1180px]">
            <main
              className={cn(
                'flex-1 min-w-0 px-4 tablet:!px-8 pb-20 tablet:!pb-4',
                topBanner ? 'py-3 sm:py-6' : 'py-6 mt-4'
              )}
            >
              <div
                className={cn(
                  'w-full max-w-full',
                  !wideContent && 'tablet:!max-w-[860px]',
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

export function PageLayout(props: PageLayoutProps) {
  return (
    <GrantProvider>
      <FundraiseProvider>
        <FeedTabsVisibilityProvider>
          <PageLayoutInner {...props} />
        </FeedTabsVisibilityProvider>
      </FundraiseProvider>
    </GrantProvider>
  );
}
