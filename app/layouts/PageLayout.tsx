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
import { usePageLayoutState } from './hooks/usePageLayoutState';
import { TopBarContainer } from './components/TopBarContainer';
import { LeftSidebarContainer } from './components/LeftSidebarContainer';
import { RightSidebarContainer } from './components/RightSidebarContainer';
import { PullToRefresh } from './components/PullToRefresh';

const MobileBottomNav = dynamic(
  () => import('./MobileBottomNav').then((mod) => mod.MobileBottomNav),
  { ssr: false }
);

interface PageLayoutProps {
  children: ReactNode;
  rightSidebar?: boolean | ReactNode;
  /** Align a custom sidebar with the main column's padded content. */
  rightSidebarTopOffset?: 'default' | 'aligned';
  className?: string;
  sidebarContentClassName?: string;
  topBanner?: ReactNode;
  /**
   * Tabs under the banner, as wide as the page: the main column and the
   * sidebar. A sibling of the row rather than inside it, so they can stick to
   * the top across the whole page as it scrolls (see WorkPageTabs).
   */
  pageTabs?: ReactNode;
  rightSidebarAbove?: ReactNode;
  /**
   * With a card above it the gray rail normally sizes to its content; this
   * keeps it stretched to the bottom of the column regardless.
   */
  rightSidebarFill?: boolean;
  /** The sidebar brings its own cards: no gray rail around it. */
  rightSidebarBare?: boolean;
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
  /**
   * The page is an app surface, not a document: it fills the area beside the
   * left column and under the top bar edge to edge and manages its own
   * scrolling. No page container, padding, right sidebar or mobile bottom nav.
   */
  fullBleed?: boolean;
}

function PageLayoutInner({
  children,
  rightSidebar = true,
  rightSidebarTopOffset = 'default',
  className,
  sidebarContentClassName,
  topBanner,
  pageTabs,
  rightSidebarAbove,
  rightSidebarFill = false,
  rightSidebarBare = false,
  contentWidth = 'default',
  wideRow = false,
  fullBleed = false,
}: PageLayoutProps) {
  const isNarrow = contentWidth === 'narrow';

  const { scrollContainerRef, isLeftSidebarOpen, toggleLeftSidebar, closeLeftSidebar } =
    usePageLayoutState();

  const { isHidden: isMobileTopNavHidden } = useMobileNavScroll({ scrollContainerRef });

  return (
    <ScrollContainerProvider
      scrollContainerRef={scrollContainerRef}
      isMobileTopNavHidden={isMobileTopNavHidden}
    >
      <div className="flex app-shell-viewport">
        <TopBarContainer
          isMobileTopNavHidden={isMobileTopNavHidden}
          isLeftSidebarOpen={isLeftSidebarOpen}
          onMenuClick={toggleLeftSidebar}
        />

        <LeftSidebarContainer isOpen={isLeftSidebarOpen} onClose={closeLeftSidebar} />

        {fullBleed ? (
          // Offset from the fixed top bar exactly as the scrollport below is,
          // but nothing here scrolls: the page lays out its own panes in the
          // height that is left, so the top bar never hides on a phone. The bottom
          // nav is the same bar as everywhere else, and its room is kept below.
          <div
            ref={scrollContainerRef}
            className={cn(
              'relative flex min-w-0 flex-1 flex-col overflow-hidden',
              'page-layout-with-mobile-bottom-nav',
              'pt-[var(--top-bar-height)] mt-0',
              'tablet:!pt-0 tablet:!mt-[var(--top-bar-height)]'
            )}
          >
            {children}
            <MobileBottomNav />
          </div>
        ) : (
          /* The scrollport. Padding clears the fixed top bar on phones, where it
             hides on scroll; a margin does from the tablet breakpoint up. The
             `page-layout-with-mobile-bottom-nav` class reserves room for the
             bottom nav where it shows. */
          <div
            ref={scrollContainerRef}
            className={cn(
              'flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain relative transition-all duration-150',
              'page-layout-with-mobile-bottom-nav',
              'pt-[var(--top-bar-height)] mt-0',
              'tablet:!pt-0 tablet:!mt-[var(--top-bar-height)]'
            )}
          >
            {/* First, so the gap it opens sits above everything on the page. A
                full-bleed page never scrolls, so it has nothing to pull down. */}
            <PullToRefresh scrollContainerRef={scrollContainerRef} />

            {topBanner && <div className="w-full">{topBanner}</div>}
            {pageTabs}

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
                  className={cn(
                    'w-full max-w-full',
                    isNarrow && 'tablet:!max-w-[860px]',
                    className
                  )}
                >
                  {children}
                </div>
              </main>

              {rightSidebar && (
                <RightSidebarContainer
                  rightSidebar={rightSidebar}
                  topOffset={rightSidebarTopOffset}
                  contentClassName={sidebarContentClassName}
                  aboveSidebar={rightSidebarAbove}
                  fill={rightSidebarFill}
                  bare={rightSidebarBare}
                  belowPageTabs={Boolean(pageTabs)}
                />
              )}
            </div>

            <MobileBottomNav />
          </div>
        )}
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
