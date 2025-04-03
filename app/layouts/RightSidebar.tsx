'use client';

import { Suspense, memo } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Avatar } from '@/components/ui/Avatar';
import { RSCBadge } from '@/components/ui/RSCBadge';
import { ContentTypeBadge } from '@/components/ui/ContentTypeBadge';
import { JournalStatusBadge } from '@/components/ui/JournalStatusBadge';
import { AuthorList, Author } from '@/components/ui/AuthorList';
import { AvatarStack } from '@/components/ui/AvatarStack';
import { Icon } from '@/components/ui/icons/Icon';
import { Progress } from '@/components/ui/Progress';
import type { FeedEntry } from '@/types/feed';
import Link from 'next/link';
import { useFeed } from '@/hooks/useFeed';
import { ArrowRightIcon } from 'lucide-react';

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

// Sample journal contributors for social proof (similar to JournalFeed)
const journalContributors = [
  {
    src: 'https://www.researchhub.com/static/editorial-board/MaulikDhandha.jpeg',
    alt: 'Maulik Dhandha',
    tooltip: 'Maulik Dhandha, Editor',
  },
  {
    src: 'https://www.researchhub.com/static/editorial-board/EmilioMerheb.jpeg',
    alt: 'Emilio Merheb',
    tooltip: 'Emilio Merheb, Editor',
  },
  {
    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/05/07/blob_48esqmw',
    alt: 'Journal Editor',
    tooltip: 'Editorial Board Member',
  },
  {
    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2025/03/04/blob_pxj9rsH',
    alt: 'Journal Editor',
    tooltip: 'Editorial Board Member',
  },
  {
    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/04/01/blob_Ut50nMY',
    alt: 'Journal Editor',
    tooltip: 'Editorial Board Member',
  },
  {
    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2024/12/23/blob_oVmwyhP',
    alt: 'Journal Editor',
    tooltip: 'Editorial Board Member',
  },
  {
    src: 'https://storage.prod.researchhub.com/uploads/author_profile_images/2023/06/25/blob',
    alt: 'Journal Editor',
    tooltip: 'Editorial Board Member',
  },
];

// RH Journal Spotlight Component
const JournalSpotlight = () => {
  const authors: Author[] = [
    { name: 'Salih Kumru' },
    { name: 'Seong Won Nho' },
    { name: 'Hossam Abdelhamed' },
    { name: 'Mark Lawrence' },
    { name: 'Attila Karsi' },
  ];

  return (
    <div className="relative bg-white rounded-lg mb-4 border border-gray-200 hover:bg-gray-50 transition-colors duration-150 overflow-hidden">
      <h2 className="absolute top-[-1px] left-[-1px] z-10 bg-indigo-50 text-indigo-600 rounded-lg py-2 px-4 text-sm font-semibold flex items-center">
        <Icon name="rhJournal1" size={16} className="mr-1.5" color="#4f46e5" />
        RH Journal Spotlight
      </h2>
      <div className="space-y-3 px-4 pb-4 pt-12">
        <img
          src="/promos/biosynthesis.png"
          alt="Biosynthesis pathway diagram"
          className="w-full max-h-[100px] rounded-md my-2 object-cover"
        />
        <a href="#" className="block hover:text-blue-600">
          <h3 className="font-bold text-lg text-gray-900 leading-tight">
            Analysis of Unique Genes Reveals Potential Role of Essential Amino Acid Synthesis
            Pathway in Flavobacterium covae Virulence
          </h3>
        </a>
        <AuthorList
          authors={authors}
          size="xs"
          delimiter=", "
          className="text-gray-500 font-normal"
        />
      </div>

      {/* Condensed Journal Promotional Section - Simplified */}
      <div className="mt-4 text-center">
        <a
          href="/journal"
          className="text-xs text-blue-600 hover:text-blue-700 hover:underline font-medium"
        >
          <div className="flex items-center justify-center gap-2 px-4 py-2">
            Learn more about the RH Journal
            <ArrowRightIcon className="w-4 h-4" />
          </div>
        </a>
      </div>
    </div>
  );
};

// Simple FundraiseProgress component that mimics the one used in FundingCarouselItem
interface FundraiseProgressProps {
  fundraise: {
    amountRaised?: { rsc: number };
    amountGoal?: { rsc: number };
  };
  compact?: boolean;
  className?: string;
  showPercentage?: boolean;
}

const FundraiseProgress = ({
  fundraise,
  compact = false,
  className,
  showPercentage = false,
}: FundraiseProgressProps) => {
  const amountRaised = fundraise?.amountRaised?.rsc || 0;
  const amountGoal = fundraise?.amountGoal?.rsc || 100;
  const percentage = Math.min(100, (amountRaised / amountGoal) * 100);
  const isComplete = percentage >= 100;

  return (
    <div className={`bg-white rounded-lg ${compact ? 'p-0' : 'p-3'} ${className || ''}`}>
      <div className="flex justify-between items-center text-xs mb-1.5">
        <div className="text-gray-700 font-medium">
          {showPercentage ? `${Math.round(percentage)}% funded` : `${amountRaised} RSC funded`}
        </div>
        {!showPercentage && <div className="text-gray-500">Goal: {amountGoal} RSC</div>}
      </div>
      <Progress
        value={amountRaised}
        max={amountGoal}
        variant={isComplete ? 'success' : 'default'}
        size="sm"
      />
    </div>
  );
};

// Funding Spotlight Skeleton Loader - updated to include progress bar
const FundingSpotlightSkeleton = () => (
  <div className="space-y-3 animate-pulse">
    <div className="flex items-center gap-2">
      <div className="h-4 bg-gray-200 rounded w-16"></div>
    </div>
    <div className="h-6 bg-gray-200 rounded w-3/4 mb-1"></div>
    <div className="flex items-center gap-2">
      <div className="w-4 h-4 bg-gray-200 rounded-full"></div>
      <div className="h-4 bg-gray-200 rounded w-24"></div>
    </div>
    <div className="h-4 bg-gray-200 rounded w-full mt-3"></div>
    <div className="h-2 bg-gray-200 rounded-lg w-full"></div>
    <div className="h-8 bg-gray-200 rounded-md w-full mt-3"></div>
  </div>
);

// Funding Spotlight - Refactored to use useFeed
const FundingSpotlight = () => {
  // Use the useFeed hook to fetch the first open funding item
  const { entries, isLoading } = useFeed('all' as any, {
    // 'all' is a placeholder, endpoint/status matter
    endpoint: 'funding_feed',
    fundraiseStatus: 'OPEN',
  });

  // Get the first funding item from the entries array
  const fundingItem = entries?.[0];

  // Determine content type and safely access content properties
  const content = fundingItem?.content as any;

  // Map fetched content type to a valid badge type ('funding' in this case)
  let badgeType: React.ComponentProps<typeof ContentTypeBadge>['type'] = 'funding';

  const title = content?.title || 'Funding Opportunity';
  const slug = content?.slug;
  const link = slug
    ? `/post/${slug}`
    : fundingItem?.relatedWork?.slug
      ? `/paper/${fundingItem.relatedWork.slug}`
      : '#';

  // Improved author handling for content and fundraise
  const authors: Author[] = [];

  // Add content creator/author if available
  if (content?.createdBy) {
    authors.push({
      name: `${content.createdBy.firstName || ''} ${content.createdBy.lastName || ''}`.trim(),
      verified: content.createdBy.isVerified,
      profileUrl: content.createdBy.profileUrl,
    });
  }

  // Add any additional authors from the content
  if (content?.authors && Array.isArray(content.authors)) {
    content.authors.forEach((author: any) => {
      if (author.fullName || (author.firstName && author.lastName)) {
        authors.push({
          name: author.fullName || `${author.firstName || ''} ${author.lastName || ''}`.trim(),
          verified: author.user?.isVerified,
          profileUrl: author.profileUrl,
        });
      }
    });
  }

  return (
    <div className="relative bg-white rounded-lg mb-4 border border-gray-200 p-4 hover:bg-gray-50 transition-colors duration-150">
      <h2 className="absolute top-[-1px] left-[-1px] z-10 bg-indigo-50 text-indigo-600 rounded-lg py-2 px-4 text-sm font-semibold flex items-center">
        <Icon name="fund" size={16} className="mr-1.5" color="#4f46e5" />
        Funding Spotlight
      </h2>
      <div className="pt-8">
        {isLoading ? (
          <FundingSpotlightSkeleton />
        ) : fundingItem && content ? (
          <div className="space-y-3">
            <Link href={link} className="block hover:text-blue-600">
              <h3 className="font-bold text-lg text-gray-900 leading-tight">{title}</h3>
            </Link>

            {/* Authors list with improved rendering */}
            {authors.length > 0 && (
              <AuthorList
                authors={authors}
                size="xs"
                delimiter=", "
                className="text-gray-500 font-normal"
              />
            )}

            {/* Fundraise progress bar */}
            {content?.fundraise && (
              <FundraiseProgress
                fundraise={content.fundraise}
                compact={true}
                className="mt-2 bg-transparent"
              />
            )}

            <Link
              href={link}
              className="block w-full text-center text-white bg-green-600 hover:bg-green-700 rounded-md px-3 py-1.5 text-xs font-medium mt-3"
            >
              View Opportunity
            </Link>
          </div>
        ) : (
          <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600 text-center">
            No open funding opportunities currently featured.
          </div>
        )}
      </div>
    </div>
  );
};

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
    {/* Journal Spotlight Section */}
    <JournalSpotlight />

    {/* Funding Spotlight Section */}
    <FundingSpotlight />

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
