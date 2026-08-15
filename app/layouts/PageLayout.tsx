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
  rightSidebarAbove?: ReactNode;
  fundraiseGrantId?: number;
  /**
   * `default` centers the page in a 1180px container and lets the main column
   * fill whatever the right sidebar doesn't use. `narrow` keeps the older
   * 1012px container with an 860px cap on the main column (used by the home tabs).
   */
  contentWidth?: 'default' | 'narrow';
  /**
   * Drop the 1180px page-container cap too, so the row spans the scrollport.
   * For pages that reserve a gutter of their own — the container's centring
   * margins would otherwise stack on top of that gutter and strand a wide band
   * of empty space beside the content.
   */
  wideRow?: boolean;
}

function PageLayoutInner({
  children,
  rightSidebar = true,
  className,
  sidebarContentClassName,
  topBanner,
  rightSidebarAbove,
  contentWidth = 'default',
  wideRow = false,
}: PageLayoutProps) {
  const isNarrow = contentWidth === 'narrow';

  const {
    scrollContainerRef,
    isLeftSidebarOpen,
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

        <LeftSidebarContainer isOpen={isLeftSidebarOpen} />

        {/* Scrollable content area.
            Mobile: top padding clears the fixed top bar (needed so content
            can scroll under the hide-on-scroll bar).
            Tablet+: top margin instead, so the scrollport starts below the bar.
            When the EndowmentPromoBanner is visible above the TopBar on mobile
            we add extra top padding to clear the banner + topbar stack.
            The banner itself is hidden at >= 768px (tablet:!hidden) so the
            offset is reset by the inner media query below.
            Bottom padding on mobile clears the fixed MobileBottomNav. */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden relative transition-all duration-150',
            'page-layout-with-mobile-bottom-nav',
            'pt-[var(--top-bar-height)] mt-0',
            'tablet:!pt-0 tablet:!mt-[var(--top-bar-height)]',
            isPromoBannerVisible && 'page-layout-with-promo-banner'
          )}
        >
          {topBanner && <div className="w-full">{topBanner}</div>}

          <div
            className={cn(
              'flex mx-auto w-full transition-[max-width] duration-200 ease-out',
              wideRow ? 'max-w-none' : isNarrow ? 'max-w-[1012px]' : 'max-w-[1180px]'
            )}
          >
            <main
              className={cn(
                'flex-1 min-w-0 px-4 tablet:!px-8 pb-4',
                topBanner ? 'py-3 sm:py-6' : 'py-6'
              )}
            >
              <div
                className={cn('w-full max-w-full', isNarrow && 'tablet:!max-w-[860px]', className)}
              >
                {children}
              </div>
            </main>

            {rightSidebar && (
              <RightSidebarContainer
                rightSidebar={rightSidebar}
                contentClassName={sidebarContentClassName}
                aboveSidebar={rightSidebarAbove}
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
