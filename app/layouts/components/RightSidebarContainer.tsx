'use client';

import { ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import { RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';
import { cn } from '@/lib/utils';
import { useWorkTab } from '@/components/work/WorkHeader/WorkTabContext';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';
import { RightSidebarSkeleton } from './RightSidebarSkeleton';
import { RightSidebar } from '../RightSidebar';

function getSidebarInstanceKey(pathname: string, rightSidebar: boolean | ReactNode): string {
  if (typeof rightSidebar !== 'boolean') {
    return `custom:${pathname}`;
  }

  if (pathname.startsWith('/paper/create')) {
    return 'rhj-create';
  }

  return 'default';
}

function RightSidebarContent({ rightSidebar }: { rightSidebar: boolean | ReactNode }) {
  const pathname = usePathname();

  if (pathname.startsWith('/paper/create')) {
    return <RHJRightSidebar showBanner={false} />;
  }

  if (typeof rightSidebar === 'boolean') {
    return <RightSidebar />;
  }

  return <>{rightSidebar}</>;
}

interface RightSidebarContainerProps {
  rightSidebar: boolean | ReactNode;
  isCompact: boolean;
  contentClassName?: string;
  /** Renders above the gray sidebar panel (e.g. About card). */
  aboveSidebar?: ReactNode;
}

export function RightSidebarContainer({
  rightSidebar,
  isCompact,
  contentClassName,
  aboveSidebar,
}: RightSidebarContainerProps) {
  const pathname = usePathname();
  const sidebarHeight = isCompact ? 'h-[calc(100vh-48px)]' : 'h-[calc(100vh-64px)]';
  const { mobileSidebarOpen, setMobileSidebarOpen } = useWorkTab();
  const sidebarKey = getSidebarInstanceKey(pathname, rightSidebar);
  const sidebarFallback = <RightSidebarSkeleton />;

  return (
    <>
      <div
        className={cn(
          'sticky top-10 mt-10 z-30',
          'lg:!flex !hidden right-sidebar:!flex',
          'w-80 flex-shrink-0 flex-col gap-3',
          sidebarHeight
        )}
      >
        {aboveSidebar}

        <aside
          className={cn(
            'min-h-0 flex-1 overflow-y-auto bg-gray-50/80 rounded-xl',
            !aboveSidebar && 'h-full'
          )}
        >
          <div className={cn('p-4 h-full', contentClassName)}>
            <Suspense fallback={sidebarFallback}>
              <RightSidebarContent key={sidebarKey} rightSidebar={rightSidebar} />
            </Suspense>
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
