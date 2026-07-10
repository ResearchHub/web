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
}

export function RightSidebarContainer({
  rightSidebar,
  isCompact,
  contentClassName,
}: RightSidebarContainerProps) {
  const pathname = usePathname();
  const sidebarHeight = isCompact ? 'h-[calc(100vh-48px)]' : 'h-[calc(100vh-64px)]';
  const { mobileSidebarOpen, setMobileSidebarOpen } = useWorkTab();
  const sidebarKey = getSidebarInstanceKey(pathname, rightSidebar);
  const sidebarFallback = <RightSidebarSkeleton />;

  return (
    <>
      <aside
        className={cn(
          'sticky top-10 overflow-y-auto mt-10',
          'lg:!block !hidden right-sidebar:!block',
          'w-80 flex-shrink-0 bg-gray-50/80 rounded-xl z-30',
          sidebarHeight
        )}
      >
        <div className={cn('p-4 h-full', contentClassName)}>
          <Suspense fallback={sidebarFallback}>
            <RightSidebarContent key={sidebarKey} rightSidebar={rightSidebar} />
          </Suspense>
        </div>
      </aside>

      <div className="lg:hidden">
        <SwipeableDrawer
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          height="85vh"
        >
          <Suspense fallback={sidebarFallback}>
            <RightSidebarContent key={sidebarKey} rightSidebar={rightSidebar} />
          </Suspense>
        </SwipeableDrawer>
      </div>
    </>
  );
}
