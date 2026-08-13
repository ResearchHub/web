'use client';

import { ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useWorkTab } from '@/components/work/WorkHeader/WorkTabContext';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { RightSidebarSkeleton } from './RightSidebarSkeleton';
import { RightSidebar } from '../RightSidebar';

function getSidebarInstanceKey(pathname: string, rightSidebar: boolean | ReactNode): string {
  if (typeof rightSidebar !== 'boolean') {
    return 'custom';
  }

  return 'default';
}

function RightSidebarContent({ rightSidebar }: { rightSidebar: boolean | ReactNode }) {
  if (typeof rightSidebar === 'boolean') {
    return <RightSidebar />;
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
  const pathname = usePathname();
  const { mobileSidebarOpen, setMobileSidebarOpen } = useWorkTab();
  const sidebarKey = getSidebarInstanceKey(pathname, rightSidebar);
  const sidebarFallback = <RightSidebarSkeleton />;

  return (
    <>
      <div
        className={cn(
          'sticky z-30 mt-10',
          // When a card sits above the gray rail, keep a gap under the top bar
          // once sticky kicks in. Other pages keep top-0 so their sidebar
          // position is unchanged.
          aboveSidebar
            ? 'top-4 h-[calc(100vh-var(--top-bar-height)-1rem)]'
            : 'top-0 h-[calc(100vh-var(--top-bar-height))]',
          'lg:!flex !hidden right-sidebar:!flex',
          'w-80 flex-shrink-0 flex-col gap-3'
        )}
      >
        {aboveSidebar}

        <aside
          className={cn(
            'min-h-0 overflow-y-auto scrollbar-on-hover bg-gray-50/80 rounded-xl',
            // With a card above it, the gray panel sizes to its content instead
            // of filling the column — otherwise a short or empty sidebar leaves
            // a tall empty rail hanging beneath that card. It still shrinks and
            // scrolls when the content is taller than the space available.
            aboveSidebar ? 'flex-initial' : 'flex-1 h-full'
          )}
        >
          <div className={cn('h-full', contentClassName)}>
            <div className="p-4 empty:hidden">
              <Suspense fallback={sidebarFallback}>
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
            <Suspense fallback={sidebarFallback}>
              <RightSidebarContent key={sidebarKey} rightSidebar={rightSidebar} />
            </Suspense>
          </div>
        </SwipeableDrawer>
      </div>
    </>
  );
}
