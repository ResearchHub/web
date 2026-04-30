'use client';

import { ReactNode, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import dynamic from 'next/dynamic';
import { RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';
import { cn } from '@/lib/utils';
import { useWorkTab } from '@/components/work/WorkHeader/WorkTabContext';
import { SwipeableDrawer } from '@/components/ui/SwipeableDrawer';

const RightSidebar = dynamic(() => import('../RightSidebar').then((mod) => mod.RightSidebar), {
  ssr: true,
});

const RightSidebarSkeleton = () => (
  <div className="p-4 pt-0">
    <div className="mb-6 h-40 bg-gray-100 rounded-lg animate-pulse" />
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse" />
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full" />
              <div className="h-4 bg-gray-200 rounded w-20" />
            </div>
            <div className="h-7 bg-gray-200 rounded-full w-16" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

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
  const sidebarHeight = isCompact ? 'h-[calc(100vh-48px)]' : 'h-[calc(100vh-64px)]';
  const { mobileSidebarOpen, setMobileSidebarOpen } = useWorkTab();

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
          <Suspense fallback={<RightSidebarSkeleton />}>
            <RightSidebarContent rightSidebar={rightSidebar} />
          </Suspense>
        </div>
      </aside>

      <div className="lg:hidden">
        <SwipeableDrawer
          isOpen={mobileSidebarOpen}
          onClose={() => setMobileSidebarOpen(false)}
          height="85vh"
        >
          <Suspense fallback={<RightSidebarSkeleton />}>
            <RightSidebarContent rightSidebar={rightSidebar} />
          </Suspense>
        </SwipeableDrawer>
      </div>
    </>
  );
}
