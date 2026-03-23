'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useMobileNavScroll } from '@/hooks/useMobileNavScroll';
import { cn } from '@/lib/utils';
import { ScrollContainerProvider } from '@/contexts/ScrollContainerContext';
import { GrantProvider } from '@/contexts/GrantContext';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
import { FeedTabsVisibilityProvider } from '@/contexts/FeedTabsVisibilityContext';
import { usePageLayoutState } from './hooks/usePageLayoutState';
import { TopBarContainer } from './components/TopBarContainer';
import { MobileOverlay } from './components/MobileOverlay';
import { LeftSidebarContainer } from './components/LeftSidebarContainer';
import { RightSidebarContainer } from './components/RightSidebarContainer';

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
}

function PageLayoutInner({
  children,
  rightSidebar = true,
  className,
  sidebarContentClassName,
  topBanner,
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

  return (
    <ScrollContainerProvider scrollContainerRef={scrollContainerRef}>
      <div className="flex h-screen">
        <TopBarContainer
          isMobileTopNavHidden={isMobileTopNavHidden}
          isLeftSidebarOpen={isLeftSidebarOpen}
          onMenuClick={toggleLeftSidebar}
        />

        <MobileOverlay show={showOverlay} visible={overlayVisible} onClose={closeLeftSidebar} />

        <LeftSidebarContainer isOpen={isLeftSidebarOpen} isCompact={isCompact} />

        {/* Scrollable content area */}
        <div
          ref={scrollContainerRef}
          className={cn(
            'flex-1 overflow-y-auto overflow-x-hidden relative transition-all duration-150',
            isCompact ? 'pt-12' : 'pt-16'
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
              <div className={cn('w-full max-w-full tablet:!max-w-[860px]', className)}>
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
