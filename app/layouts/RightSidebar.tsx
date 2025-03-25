'use client';

import { Suspense, memo } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Avatar } from '@/components/ui/Avatar';

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

// Top Peer Reviewers Component
const TopPeerReviewers = () => {
  // Hardcoded reviewers data for now
  const reviewers = [
    { id: 1, name: 'Sarah Johnson', src: 'https://randomuser.me/api/portraits/women/12.jpg' },
    { id: 2, name: 'Mark Davis', src: 'https://randomuser.me/api/portraits/men/32.jpg' },
    { id: 3, name: 'Emily Chen', src: 'https://randomuser.me/api/portraits/women/22.jpg' },
  ];

  return (
    <div className="mb-0 bg-white rounded-lg p-4 pl-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Top Peer Reviewers</h2>
        <span className="text-xs text-gray-500">This week</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {reviewers.map((reviewer) => (
          <div key={reviewer.id} className="flex flex-col items-center">
            <Avatar src={reviewer.src} alt={reviewer.name} size="sm" className="mb-1" />
            <span className="text-xs text-gray-700 max-w-[60px] truncate text-center">
              {reviewer.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Top Funders Component
const TopFunders = () => {
  // Hardcoded funders data for now
  const funders = [
    { id: 1, name: 'Alex Morgan', src: 'https://randomuser.me/api/portraits/men/62.jpg' },
    { id: 2, name: 'Julia Roberts', src: 'https://randomuser.me/api/portraits/women/72.jpg' },
    { id: 3, name: 'Vikram Patel', src: 'https://randomuser.me/api/portraits/men/82.jpg' },
  ];

  return (
    <div className="mb-6 bg-white rounded-lg p-4 pl-0">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-gray-900">Top Funders</h2>
        <span className="text-xs text-gray-500">This week</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {funders.map((funder) => (
          <div key={funder.id} className="flex flex-col items-center">
            <Avatar src={funder.src} alt={funder.name} size="sm" className="mb-1" />
            <span className="text-xs text-gray-700 max-w-[60px] truncate text-center">
              {funder.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

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

    {/* Top Peer Reviewers Section */}
    <TopPeerReviewers />

    {/* Top Funders Section */}
    <TopFunders />

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
