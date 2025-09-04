'use client';

import { ReactNode, useState, Suspense, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';
import { OnboardingModal } from '@/components/Onboarding/OnboardingModal';
import { cn } from '@/lib/utils';
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
  className?: string;
}

export function PageLayout({ children, rightSidebar = true, className }: PageLayoutProps) {
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [showOverlay, setShowOverlay] = useState(false);
  const [overlayVisible, setOverlayVisible] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const rightSidebarRef = useRef<HTMLDivElement>(null);
  const rightSidebarWrapperRef = useRef<HTMLDivElement>(null);
  const [sidebarTransform, setSidebarTransform] = useState(0);
  const animationFrameId = useRef<number | null>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      if (
        !scrollContainerRef.current ||
        !rightSidebarRef.current ||
        !rightSidebarWrapperRef.current
      )
        return;

      // Cancel any pending animation frame to avoid unnecessary updates
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }

      animationFrameId.current = requestAnimationFrame(() => {
        if (
          !scrollContainerRef.current ||
          !rightSidebarRef.current ||
          !rightSidebarWrapperRef.current
        )
          return;

        const scrollContainer = scrollContainerRef.current;
        const sidebar = rightSidebarRef.current;

        const sidebarHeight = sidebar.scrollHeight;
        const viewportHeight = window.innerHeight; // Use viewport height
        const scrollTop = scrollContainer.scrollTop;

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

    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      // Initial calculation in case content is already scrolled or fits
      handleScroll();

      return () => {
        scrollContainer.removeEventListener('scroll', handleScroll);
        // Cancel any pending animation frame on cleanup
        if (animationFrameId.current) {
          cancelAnimationFrame(animationFrameId.current);
        }
      };
    }
  }, []); // Removed sidebarTransform from dependencies as it caused potential loops

  useEffect(() => {
    if (isLeftSidebarOpen) {
      setShowOverlay(true);
      setTimeout(() => setOverlayVisible(true), 0);
    } else {
      setOverlayVisible(false);
      const timeout = setTimeout(() => setShowOverlay(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [isLeftSidebarOpen]);

  // Lock body scroll when left sidebar is open on mobile
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;

    if (isMobile && isLeftSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isLeftSidebarOpen]);

  return (
    <div className="flex h-screen">
      <OnboardingModal />

      {/* Fixed TopBar starting from LeftSidebar edge */}
      <div
        className="fixed top-0 right-0 z-[60] tablet:!z-50 bg-white
                      left-0 tablet:!left-72 tablet:sidebar-compact:!left-72 tablet:max-sidebar-compact:!left-[70px]"
      >
        <Suspense fallback={<TopBarSkeleton />}>
          <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
        </Suspense>
      </div>

      {/* Mobile overlay */}
      {showOverlay && (
        <div
          className={`fixed inset-0 bg-black ${
            overlayVisible ? 'opacity-50' : 'opacity-0'
          } z-40 tablet:!hidden transition-opacity duration-300 ease-in-out`}
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      {/* Left Sidebar Container (Sticky) */}
      <div
        className={`
          tablet:!sticky tablet:!top-0 tablet:!h-screen bg-white border-r border-gray-200
          z-50 tablet:!z-30
          flex-shrink-0

          transition-all duration-300 ease-in-out
          tablet:!transition-none

          tablet:!translate-x-0
          tablet:sidebar-compact:!w-72
          tablet:max-sidebar-compact:!w-[70px]

          fixed top-[64px] w-[280px] h-[calc(100vh-64px)] max-h-[calc(100vh-64px)] flex flex-col
          ${isLeftSidebarOpen ? '!translate-x-0' : '!-translate-x-full'}

          tablet:!block tablet:!w-72
        `}
      >
        <Suspense fallback={<div className="w-full h-screen bg-gray-100 animate-pulse"></div>}>
          <LeftSidebar />
        </Suspense>
      </div>

      {/* Center Content Area (Scrolling) */}
      <div
        ref={scrollContainerRef}
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative"
        style={{ marginTop: '64px' }}
      >
        {/* Main Content */}
        <main
          ref={mainContentRef}
          className={`flex-1 px-4 tablet:!px-8 py-4 flex justify-center ${
            rightSidebar ? 'lg:!pr-80 right-sidebar:!pr-80' : ''
          }`}
          style={{ maxWidth: '100vw' }}
        >
          <div
            className={cn(
              'w-full',
              'max-w-full tablet:!max-w-2xl content-md:!max-w-2xl content-lg:!max-w-3xl content-xl:!max-w-4xl',
              className
            )}
          >
            {children}
          </div>
        </main>

        {/* Right Sidebar (Fixed to viewport edge) */}
        {rightSidebar && (
          <aside
            ref={rightSidebarWrapperRef}
            className="fixed top-16 right-0 h-[calc(100vh-64px)] overflow-hidden
                      lg:!block !hidden right-sidebar:!block w-80 bg-white
                      z-30"
          >
            <div
              ref={rightSidebarRef}
              style={{ transform: `translateY(${sidebarTransform}px)` }}
              className="transition-transform duration-150 ease-out h-full"
            >
              {/* Sidebar Content */}
              <div className="px-4 pt-4">
                <Suspense fallback={<RightSidebarSkeleton />}>
                  {pathname.startsWith('/paper/create') ? (
                    <RHJRightSidebar showBanner={false} />
                  ) : typeof rightSidebar === 'boolean' ? (
                    <RightSidebar />
                  ) : (
                    rightSidebar
                  )}
                </Suspense>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
