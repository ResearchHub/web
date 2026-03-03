'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { useMobileNavScroll } from '@/hooks/useMobileNavScroll';
import { OnboardingModalWrapper } from '@/components/Onboarding/NewUserOnboarding';
import { cn } from '@/lib/utils';
import { ScrollContainerProvider } from '@/contexts/ScrollContainerContext';
import { GrantProvider } from '@/contexts/GrantContext';
import { FundraiseProvider } from '@/contexts/FundraiseContext';
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
}

export function PageLayout({
  children,
  rightSidebar = true,
  className,
  sidebarContentClassName,
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
    <GrantProvider>
      <FundraiseProvider>
        <ScrollContainerProvider scrollContainerRef={scrollContainerRef}>
          <div className="flex h-screen">
            <OnboardingModalWrapper />

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
              <div className="flex mx-auto w-full max-w-[1180px]">
                <main className="flex-1 min-w-0 px-4 tablet:!px-8 py-6 pb-20 tablet:!pb-4 mt-4">
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
      </FundraiseProvider>
    </GrantProvider>
  );
}
