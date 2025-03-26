'use client';

import { ReactNode, useState, Suspense } from 'react';
import dynamic from 'next/dynamic';

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
    <div className="min-h-screen bg-white">
      {/* Mobile overlay */}
      {isLeftSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsLeftSidebarOpen(false)}
        />
      )}

      <div className="flex">
        {/* Left Sidebar */}
        <div
          className={`
          fixed lg:sticky top-0 left-0 h-screen bg-white z-40 w-72 transform transition-transform duration-200 ease-in-out
          lg:translate-x-0
          ${isLeftSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        >
          <Suspense fallback={<div className="w-full h-screen bg-gray-100 animate-pulse"></div>}>
            <LeftSidebar />
          </Suspense>
        </div>

        {/* Main Content Area with TopBar and Right Sidebar */}
        <div className="flex-1">
          <Suspense fallback={<TopBarSkeleton />}>
            <TopBar onMenuClick={() => setIsLeftSidebarOpen(!isLeftSidebarOpen)} />
          </Suspense>

          <div className="flex py-8">
            {/* Main Content */}
            <main className="flex-1 px-4 lg:px-8">
              <div className="mx-auto max-w-4xl">{children}</div>
            </main>

            {/* Right Sidebar */}
            {rightSidebar && (
              <div className="hidden lg:block w-80 bg-white">
                <div className="sticky top-[64px] p-4 pt-0 overflow-y-auto max-h-[calc(100vh-64px)]">
                  <Suspense fallback={<RightSidebarSkeleton />}>
                    {typeof rightSidebar === 'boolean' ? <RightSidebar /> : rightSidebar}
                  </Suspense>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
