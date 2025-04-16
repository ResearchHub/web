'use client';

import { ReactNode, useState, Suspense } from 'react';
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

// Simple loading skeletons
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

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Check if user should be redirected to onboarding */}
      <OnboardingRedirect />

      {/* Mobile overlay */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 tablet:!hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      <div className="flex">
        <div
          className={`
            fixed tablet:!sticky top-0 left-0 h-screen bg-white border-r border-gray-200
            z-50 tablet:z-30 
            transition-all duration-200 ease-in-out
            
            tablet:!translate-x-0 
            tablet:sidebar-compact:!w-72
            tablet:max-sidebar-compact:!w-[70px]
            
            ${isLeftSidebarOpen ? '!translate-x-0 w-[280px]' : '!-translate-x-full w-[280px]'}
          `}
        >
          <Suspense fallback={<div className="w-full h-screen bg-gray-100 animate-pulse"></div>}>
            <LeftSidebar />
          </Suspense>
        </div>

        {/* Main Content Area with TopBar and Right Sidebar */}
        <div className="flex-1">
          {/* Conditionally render TopBar based on topbar-hide breakpoint */}
          <div className="topbar-hide:!hidden">
            <Suspense fallback={<TopBarSkeleton />}>
              <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
            </Suspense>
          </div>

          <div className="flex">
            {/* Main Content with responsive max-width */}
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

            {/* Right Sidebar - Hidden below right-sidebar breakpoint */}
            {rightSidebar && (
              <aside className="lg:!block !hidden right-sidebar:!block w-80 bg-white py-8 px-4">
                {/* Search Bar Added Back - Visible only when sidebar is visible */}
                <div className="mb-4">
                  <Search
                    placeholder="Search..."
                    className="[&_input]:rounded-full [&_input]:bg-[#F8F9FC]"
                  />
                </div>

                {/* Sticky container for the rest of the sidebar */}
                <div className="!sticky top-16 overflow-y-auto pb-8 max-h-[calc(100vh-64px)]">
                  <Suspense fallback={<RightSidebarSkeleton />}>
                    {typeof rightSidebar === 'boolean' ? <RightSidebar /> : rightSidebar}
                  </Suspense>
                </div>
              </aside>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
