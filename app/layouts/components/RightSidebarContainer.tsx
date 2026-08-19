'use client';

import { ReactNode, Suspense } from 'react';
import { cn } from '@/lib/utils';
import { useWorkTab } from '@/components/work/WorkHeader/WorkTabContext';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { FundSidebar } from '@/components/Funding/FundSidebar';
import { FundingPowerCard } from '@/components/Funding/FundingPowerCard';

function RightSidebarContent({ rightSidebar }: { rightSidebar: boolean | ReactNode }) {
  if (typeof rightSidebar === 'boolean') {
    return <FundSidebar />;
  }

  return <>{rightSidebar}</>;
}

interface RightSidebarContainerProps {
  rightSidebar: boolean | ReactNode;
  contentClassName?: string;
  aboveSidebar?: ReactNode;
}

export function RightSidebarContainer({
  rightSidebar,
  contentClassName,
  aboveSidebar,
}: RightSidebarContainerProps) {
  const { mobileSidebarOpen, setMobileSidebarOpen } = useWorkTab();
  const isDefaultSidebar = typeof rightSidebar === 'boolean';
  const sidebarKey = isDefaultSidebar ? 'default' : 'custom';

  // Pages on the default sidebar get the funding power card on top unless they
  // supply their own card. Pages with a bespoke sidebar (papers, journal, etc.)
  // are left alone.
  const cardAboveSidebar =
    aboveSidebar ?? (isDefaultSidebar ? <FundingPowerCard className="w-full" /> : undefined);

  return (
    <>
      <div
        className={cn(
          'sticky z-30 mt-10',
          // When a card sits above the gray rail, keep a gap under the top bar
          // once sticky kicks in. Other pages keep top-0 so their sidebar
          // position is unchanged.
          cardAboveSidebar
            ? 'top-4 h-[calc(100vh-var(--top-bar-height)-1rem)]'
            : 'top-0 h-[calc(100vh-var(--top-bar-height))]',
          'lg:!flex !hidden right-sidebar:!flex',
          'w-80 flex-shrink-0 flex-col gap-3'
        )}
      >
        {cardAboveSidebar}

        <aside
          className={cn(
            'min-h-0 overflow-y-auto scrollbar-on-hover bg-gray-50/80 rounded-xl',
            // With a card above it, the gray panel sizes to its content instead
            // of filling the column — otherwise a short or empty sidebar leaves
            // a tall empty rail hanging beneath that card. It still shrinks and
            // scrolls when the content is taller than the space available.
            cardAboveSidebar ? 'flex-initial' : 'flex-1 h-full'
          )}
        >
          <div className={cn('h-full', contentClassName)}>
            <div className="p-4 empty:hidden">
              <Suspense fallback={null}>
                <RightSidebarContent key={sidebarKey} rightSidebar={rightSidebar} />
              </Suspense>
            </div>
          </div>
        </aside>
      </div>

      <div className="lg:hidden">
        <SwipeableDrawer
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          height="85vh"
        >
          <div className="space-y-3">
            {aboveSidebar}
            <Suspense fallback={null}>
              <RightSidebarContent key={sidebarKey} rightSidebar={rightSidebar} />
            </Suspense>
          </div>
        </SwipeableDrawer>
      </div>
    </>
  );
}
