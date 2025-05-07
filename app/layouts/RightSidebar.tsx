'use client';

import { Suspense, memo } from 'react';
import dynamic from 'next/dynamic';
import { LoadingSkeleton } from './components/LoadingSkeleton';
import { Avatar } from '@/components/ui/Avatar';
import { CurrencyBadge } from '@/components/ui/CurrencyBadge';
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
import { FundraiseProgress } from '@/components/Fund/FundraiseProgress';
import { LeaderboardOverview } from '@/components/Leaderboard/LeaderboardOverview';
import { useRecentWorks } from '@/hooks/useRecentWorks';
import { Work } from '@/types';
import { useTrendingWorks } from '@/hooks/useTrendingWorks';

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

  // The specific paper URL from the request
  const paperUrl =
    'https://new.researchhub.com/paper/9324244/analysis-of-unique-genes-reveals-potential-role-of-essential-amino-acid-synthesis-pathway-in-flavobacterium-covae-virulence';

  return (
    <Link href={paperUrl} className="block">
      <div className="relative bg-white rounded-lg mb-4 border border-gray-200 hover:bg-gray-50 transition-colors duration-150 overflow-hidden cursor-pointer">
        <h2 className="absolute top-[-1px] left-[-1px] z-10 bg-indigo-50 text-indigo-600 rounded-lg py-2 px-4 text-sm font-medium flex items-center">
          <Icon name="rhJournal1" size={16} className="mr-1.5" color="#4f46e5" />
          RH Journal Spotlight
        </h2>
        <div className="space-y-3 px-4 pb-4 pt-12">
          <img
            src="/promos/biosynthesis2.png"
            alt="Biosynthesis pathway diagram"
            className="w-full max-h-[100px] rounded-md my-2 object-cover"
          />
          <h3 className="font-bold text-md text-gray-900 leading-tight">
            Analysis of Unique Genes Reveals Potential Role of Essential Amino Acid Synthesis
            Pathway in Flavobacterium covae Virulence
          </h3>
          <AuthorList
            authors={authors}
            size="xs"
            delimiter=", "
            className="text-gray-500 font-normal"
          />
        </div>

        {/* Condensed Journal Promotional Section - Simplified */}
        <div className="mb-2 text-center">
          <div className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium flex items-center justify-center gap-2 px-4 py-2">
            Learn more about the RH Journal
          </div>
        </div>
      </div>
    </Link>
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

  const title = content?.title || 'Funding Opportunity';
  const slug = content?.slug;
  const id = content?.id;

  // Create the funding URL using the same format as in FeedItemFundraise
  const fundingUrl = id && slug ? `/fund/${id}/${slug}` : '/fund';

  // Improved author handling for content and fundraise
  const authors: Author[] = [];

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
    <Link href={fundingUrl} className="block">
      <div className="relative bg-white rounded-lg mb-4 border border-gray-200 p-4 hover:bg-gray-50 transition-colors duration-150 cursor-pointer">
        <h2 className="absolute top-[-1px] left-[-1px] z-10 bg-indigo-50 text-indigo-600 rounded-lg py-2 px-4 text-sm font-medium flex items-center">
          <Icon name="fund" size={16} className="mr-1.5" color="#4f46e5" />
          Funding Spotlight
        </h2>
        <div className="pt-8">
          {isLoading ? (
            <FundingSpotlightSkeleton />
          ) : fundingItem && content ? (
            <div className="space-y-3">
              <h3 className="font-bold text-md text-gray-900 leading-tight">{title}</h3>

              {/* Authors list with improved rendering */}
              {authors.length > 0 && (
                <AuthorList
                  authors={authors}
                  size="xs"
                  delimiter=", "
                  className="text-gray-500 font-normal"
                />
              )}

              {/* Fundraise progress bar - now with minimal variant */}
              {content?.fundraise && (
                <div onClick={(e) => e.stopPropagation()}>
                  <FundraiseProgress
                    fundraise={content.fundraise}
                    variant="minimal"
                    className="mt-2"
                  />
                </div>
              )}

              {/* Changed from button to text link */}
              <div className="text-center pt-2">
                <span className="text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium">
                  Need money for your research?
                </span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-100 p-3 rounded-md text-sm text-gray-600 text-center">
              No open funding opportunities currently featured.
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// Main RightSidebar Component - memoized to prevent re-renders when parent components change
const SidebarComponent = () => (
  <div className="space-y-4 overflow-hidden">
    {/* Journal Spotlight Section */}
    <JournalSpotlight />

    {/* Funding Spotlight Section */}
    <FundingSpotlight />

    {/* Dynamic Leaderboard Section */}
    <LeaderboardOverview />

    {/* Topics to Follow Section */}
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
