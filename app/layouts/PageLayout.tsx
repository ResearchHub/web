'use client';

import { ReactNode, useState, Suspense, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Search } from '@/components/Search/Search';
import { OnboardingRedirect } from '@/components/OnboardingRedirect';

// Dynamically import sidebar components
const LeftSidebar = dynamic(() => import('./LeftSidebar').then((mod) => mod.LeftSidebar), {
  ssr: true,
  loading: () => <div className="w-full h-screen bg-gray-100 animate-pulse"></div>,
});

const RightSidebar = dynamic(() => import('./RightSidebar').then((mod) => mod.RightSidebar), {
  ssr: true,
});

const TopBar = dynamic(() => import('./TopBar').then((mod) => mod.TopBar), {
  ssr: true,
});

// Simple loading skeletons remain the same...
const TopBarSkeleton = () => (
  <div className="h-16 w-full border-b border-gray-200 bg-gray-50 animate-pulse"></div>
);

const RightSidebarSkeleton = () => (
  <div className="p-4 pt-0">
    <div className="mb-6 h-40 bg-gray-100 rounded-lg animate-pulse"></div>
    <div className="space-y-2">
      <div className="h-4 bg-gray-100 rounded w-1/2 animate-pulse"></div>
      <div className="space-y-3">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
            <div className="h-7 bg-gray-200 rounded-full w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

interface PageLayoutProps {
  children: ReactNode;
  rightSidebar?: boolean | ReactNode;
}

export function PageLayout({ children, rightSidebar = true }: PageLayoutProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarWrapperRef = useRef<HTMLDivElement>(null);
  const [sidebarTransform, setSidebarTransform] = useState(0);
  const animationFrameId = useRef<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!mainContentRef.current || !rightSidebarRef.current || !rightSidebarWrapperRef.current)
        return;

      // Cancel any pending animation frame to avoid unnecessary updates
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        if (!mainContentRef.current || !rightSidebarRef.current || !rightSidebarWrapperRef.current)
          return;

        const mainContent = mainContentRef.current;
        const sidebar = rightSidebarRef.current;

        const sidebarHeight = sidebar.scrollHeight;
        const viewportHeight = window.innerHeight; // Use viewport height
        const scrollTop = mainContent.scrollTop;

        // Max distance sidebar needs to move up
        const maxScroll = Math.max(0, sidebarHeight - viewportHeight);

        // Define the scroll distance in main content after which sidebar should be fully scrolled
        // Adjust the multiplier (e.g., 1, 1.5, 2) to control how fast the sidebar reaches the bottom.
        // A smaller multiplier means it reaches the bottom faster.
        const triggerDistance = viewportHeight * 1.5;

        // Calculate how far into the trigger distance the user has scrolled
        const scrollRatio = triggerDistance > 0 ? scrollTop / triggerDistance : 0;

        // Clamp the ratio between 0 and 1
        const clampedScrollRatio = Math.min(1, Math.max(0, scrollRatio));

        // Calculate the new transform based on the clamped ratio
        let newTransform = -clampedScrollRatio * maxScroll;

        // Ensure transform doesn't exceed bounds (redundant due to clamping, but safe)
        newTransform = Math.max(newTransform, -maxScroll);
        newTransform = Math.min(newTransform, 0);

        setSidebarTransform(newTransform);
        animationFrameId.current = null; // Clear the ref after execution
      });
    };

    const mainContent = mainContentRef.current;
    if (mainContent) {
      mainContent.addEventListener('scroll', handleScroll);
      // Initial calculation in case content is already scrolled or fits
      handleScroll();

      return () => {
        mainContent.removeEventListener('scroll', handleScroll);
        // Cancel any pending animation frame on cleanup
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, []); // Removed sidebarTransform from dependencies as it caused potential loops

  return (
    <div className="flex h-screen">
      <OnboardingRedirect />

      {/* Mobile overlay */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 tablet:!hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Container (Sticky) */}
      <div
        className={`
          sticky top-0 h-screen bg-white border-r border-gray-200
          z-50 tablet:z-30
          transition-all duration-200 ease-in-out
          flex-shrink-0

          tablet:!translate-x-0
          tablet:sidebar-compact:!w-72
          tablet:max-sidebar-compact:!w-[70px]

          ${isLeftSidebarOpen ? '!translate-x-0 w-[280px] block' : '!-translate-x-full w-[280px] hidden'}

          tablet:!block tablet:w-72
        `}
      >
        <Suspense fallback={<div className="w-full h-screen bg-gray-100 animate-pulse"></div>}>
          <LeftSidebar />
        </Suspense>
      </div>

      {/* Center Content Area (Scrolling) */}
      <div ref={mainContentRef} className="flex-1 flex flex-col overflow-y-auto">
        {/* TopBar (Sticky within Center Column) */}
        <div className="topbar-hide:!hidden sticky top-0 z-40 bg-white flex-shrink-0">
          <Suspense fallback={<TopBarSkeleton />}>
            <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
          </Suspense>
        </div>

        {/* Main Content */}
        <main className="flex-1 px-4 tablet:!px-8 py-8" style={{ maxWidth: '100vw' }}>
          <div
            className="mx-auto
              max-w-full
              tablet:!max-w-2xl
              content-md:!max-w-2xl
              content-lg:!max-w-3xl
              content-xl:!max-w-4xl
            "
          >
            {children}
          </div>
        </main>
      </div>

      {/* Right Sidebar (Sticky) */}
      {rightSidebar && (
        <aside
          ref={rightSidebarWrapperRef}
          className="sticky top-0 h-screen overflow-hidden
                    lg:!block !hidden right-sidebar:!block w-80 bg-white
                     flex-shrink-0 pr-4"
        >
          <div
            ref={rightSidebarRef}
            style={{ transform: `translateY(${sidebarTransform}px)` }}
            // Added transition for smoother movement
            className="transition-transform duration-150 ease-out"
          >
            {/* Search Bar */}
            <div className="sticky top-0 z-10 bg-white pt-8 pb-4">
              <Search
                placeholder="Search..."
                className="[&_input]:rounded-full [&_input]:bg-[#F8F9FC]"
              />
            </div>

            {/* Sidebar Content */}
            <div className="">
              <Suspense fallback={<RightSidebarSkeleton />}>
                {typeof rightSidebar === 'boolean' ? <RightSidebar /> : rightSidebar}
              </Suspense>
            </div>
          </div>
        </aside>
      )}
    </div>
  );
}
