'use client';

import { ReactNode, useState, Suspense, useEffect, useRef } from 'react';
import { useMobileNavScroll } from '@/hooks/useMobileNavScroll';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
import { RHJRightSidebar } from '@/components/Journal/RHJRightSidebar';
import { OnboardingModalWrapper } from '@/components/Onboarding/NewUserOnboarding';
import { cn } from '@/lib/utils';
import { ScrollContainerProvider } from '@/contexts/ScrollContainerContext';
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

const MobileBottomNav = dynamic(
  () => import('./MobileBottomNav').then((mod) => mod.MobileBottomNav),
  {
    ssr: false,
  }
);

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
  const pathname = usePathname();

  // Mobile top nav scroll hide/show
  const { isHidden: isMobileTopNavHidden } = useMobileNavScroll({
    scrollContainerRef,
  });

  const [isCompact, setIsCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        setIsCompact(scrollContainerRef.current.scrollTop > 100);
      }
    };

    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      handleScroll();
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

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

  return (
    <ScrollContainerProvider scrollContainerRef={scrollContainerRef}>
      <div className="flex h-screen">
        <OnboardingModalWrapper />

        {/* Fixed TopBar starting from LeftSidebar edge */}
        <div
          className={`fixed top-0 right-0 z-[60] tablet:!z-50 tablet:!bg-white
                        left-0 tablet:!left-72 tablet:sidebar-compact:!left-72 tablet:max-sidebar-compact:!left-[70px]
                        transition-transform duration-300 ease-in-out tablet:!transform-none
                        ${isMobileTopNavHidden && !isLeftSidebarOpen ? '-translate-y-full' : 'translate-y-0'}`}
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

            fixed transition-all duration-150
            ${isCompact ? 'top-[48px] h-[calc(100vh-48px)]' : 'top-[64px] h-[calc(100vh-64px)]'}
            w-[280px]
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
          className={`flex-1 flex flex-col overflow-y-auto overflow-x-hidden relative transition-all duration-150 ${
            isCompact ? 'pt-12' : 'pt-16'
          }`}
        >
          {/* Main Content */}
          <main
            ref={mainContentRef}
            className={`flex-1 px-4 tablet:!px-8 py-4 pb-20 tablet:!pb-4 flex justify-center ${
              rightSidebar ? 'lg:!pr-80 right-sidebar:!pr-80' : ''
            }`}
            style={{ maxWidth: '100vw' }}
          >
            <div
              className={cn(
                'w-full',
                'max-w-full tablet:!max-w-[760px] content-md:!max-w-[760px] content-lg:!max-w-[760px] content-xl:!max-w-[760px]',
                className
              )}
            >
              {children}
            </div>
          </main>

          {/* Right Sidebar (Fixed to viewport edge) */}
          {rightSidebar && (
            <aside
              className={`fixed right-0 overflow-y-auto transition-all duration-150
                    lg:!block !hidden right-sidebar:!block w-80 bg-white border-l border-gray-200
                    z-30 ${isCompact ? 'top-12 h-[calc(100vh-48px)]' : 'top-16 h-[calc(100vh-64px)]'}`}
            >
              {/* Sidebar Content */}
              <div className="">
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
            </aside>
          )}
          {/* Mobile Bottom Navigation */}
          <MobileBottomNav />
        </div>
      </div>
    </ScrollContainerProvider>
  );
}
