'use client';

import { Suspense, memo } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from './components/LoadingSkeleton';

// Dynamically import InfoBanner component
const InfoBanner = dynamic(() => import('./components/InfoBanner').then((mod) => mod.InfoBanner), {
  ssr: true,
  loading: () => (
    <div className="bg-gray-100 rounded-lg p-5 mb-6 animate-pulse">
      <div className="flex flex-col items-center mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-1"></div>
      </div>
      <div className="space-y-2.5 mb-5">
        {[1, 2, 3].map((_, i) => (
          <div key={i} className="flex items-center space-x-2.5">
            <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
            <div className="h-4 bg-gray-200 rounded w-32"></div>
          </div>
        ))}
      </div>
      <div className="h-10 bg-gray-200 rounded-md w-full"></div>
    </div>
  ),
});

// Dynamically import TopicsToFollow component
const TopicsToFollow = dynamic(
  () => import('./components/TopicsToFollow').then((mod) => mod.TopicsToFollow),
  {
    ssr: false,
    loading: () => (
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Follow Recommendations</h2>
        <LoadingSkeleton />
        <div className="border-t border-gray-200 my-4"></div>
        <LoadingSkeleton />
      </div>
    ),
  }
);

// Main RightSidebar Component - memoized to prevent re-renders when parent components change
const SidebarComponent = () => (
  <div>
    <Suspense
      fallback={
        <div className="bg-gray-100 rounded-lg p-5 mb-6 animate-pulse">
          <div className="flex flex-col items-center mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full mb-2"></div>
            <div className="h-6 bg-gray-200 rounded w-48 mb-1"></div>
          </div>
          <div className="space-y-2.5 mb-5">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className="flex items-center space-x-2.5">
                <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
                <div className="h-4 bg-gray-200 rounded w-32"></div>
              </div>
            ))}
          </div>
          <div className="h-10 bg-gray-200 rounded-md w-full"></div>
        </div>
      }
    >
      <InfoBanner />
    </Suspense>

    <Suspense
      fallback={
        <div>
          <h2 className="font-semibold text-gray-900 mb-4">Follow Recommendations</h2>
          <LoadingSkeleton />
          <div className="border-t border-gray-200 my-4"></div>
          <LoadingSkeleton />
        </div>
      }
    >
      <TopicsToFollow />
    </Suspense>
  </div>
);

export const RightSidebar = memo(SidebarComponent);
RightSidebar.displayName = 'RightSidebar';
