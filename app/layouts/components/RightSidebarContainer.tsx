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
    return `custom:${pathname}`;
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
          'sticky top-0 mt-10 z-30',
          'h-[calc(100vh-var(--top-bar-height))]',
          'lg:!flex !hidden right-sidebar:!flex',
          'w-80 flex-shrink-0 flex-col gap-3'
        )}
      >
        {aboveSidebar}

        <aside
          className={cn(
            'min-h-0 flex-1 overflow-y-auto scrollbar-on-hover bg-gray-50/80 rounded-xl',
            !aboveSidebar && 'h-full'
          )}
        >
          <div className={cn('h-full', contentClassName)}>
            <div className="p-4">
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
