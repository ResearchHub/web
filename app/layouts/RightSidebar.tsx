'use client';

import { Suspense, memo } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Avatar } from '@/components/ui/Avatar';
import { RSCBadge } from '@/components/ui/RSCBadge';

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
  // Updated reviewers data with RSC amounts
  const reviewers = [
    {
      id: 1872191,
      name: 'Maureen Meister',
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/10/29/blob_EpeS0De',
      href: 'https://www.researchhub.com/author/1872191',
      rsc: 250,
    },
    {
      id: 1872065,
      name: 'Rami Najjar',
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/07/14/blob_bLCOrF0',
      href: 'https://www.researchhub.com/author/1872065',
      rsc: 180,
    },
    {
      id: 1871613,
      name: 'Leonardo Furstenau',
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/08/blob_DKyMqJ1',
      href: 'https://www.researchhub.com/author/1871613',
      rsc: 150,
    },
  ];

  return (
    <div className="mb-4 bg-white rounded-lg p-4 pl-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-900">Top Peer Reviewers</h2>
        <span className="text-xs text-gray-500">This week</span>
      </div>
      <div className="space-y-2">
        {reviewers.map((reviewer) => (
          <a
            key={reviewer.id}
            href={reviewer.href}
            className="flex items-center justify-between hover:bg-gray-50 p-1 rounded-md"
          >
            <div className="flex items-center gap-2">
              <Avatar src={reviewer.src} alt={reviewer.name} size="xs" />
              <span className="text-sm font-medium text-gray-900">{reviewer.name}</span>
            </div>
            <RSCBadge amount={reviewer.rsc} variant="text" size="xs" showExchangeRate={false} />
          </a>
        ))}
      </div>
    </div>
  );
};

// Top Funders Component
const TopFunders = () => {
  // Updated funders data with new people and RSC amounts
  const funders = [
    {
      id: 572,
      name: 'Natalya Efremova',
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/01/23/blob_iU88Om0',
      href: 'https://www.researchhub.com/author/572',
      rsc: 160,
    },
    {
      id: 952195,
      name: 'Cole Delya',
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2022/07/29/blob',
      href: 'https://www.researchhub.com/author/952195',
      rsc: 2000,
    },
    {
      id: 0,
      name: 'Shashikant Kotwal',
      src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/27/blob_bvG0QSu',
      href: '#',
      rsc: 100,
    },
  ];

  return (
    <div className="mb-4 bg-white rounded-lg p-4 pl-0">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-semibold text-gray-900">Top Funders</h2>
        <span className="text-xs text-gray-500">This week</span>
      </div>
      <div className="space-y-2">
        {funders.map((funder) => (
          <a
            key={funder.id}
            href={funder.href}
            className="flex items-center justify-between hover:bg-gray-50 p-1 rounded-md"
          >
            <div className="flex items-center gap-2">
              <Avatar src={funder.src} alt={funder.name} size="xs" />
              <span className="text-sm font-medium text-gray-900">{funder.name}</span>
            </div>
            <RSCBadge amount={funder.rsc} variant="text" size="xs" showExchangeRate={false} />
          </a>
        ))}
      </div>
    </div>
  );
};

// Main RightSidebar Component - memoized to prevent re-renders when parent components change
const SidebarComponent = () => (
  <div className="space-y-4">
    <Suspense
      fallback={
        <div className="bg-gray-100 rounded-lg p-5 mb-4 animate-pulse">
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
          <h2 className="font-semibold text-gray-900 mb-3">Follow Recommendations</h2>
          <LoadingSkeleton />
          <div className="border-t border-gray-200 my-3"></div>
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
