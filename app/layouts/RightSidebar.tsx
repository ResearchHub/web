'use client';

import { memo } from 'react';
import dynamic from 'next/dynamic';
import { usePathname } from 'next/navigation';
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
import { ArrowRightIcon } from 'lucide-react';
import { LeaderboardSkeleton } from '@/components/Leaderboard/LeaderboardOverview';

const LeaderboardOverview = dynamic(
  () =>
    import('@/components/Leaderboard/LeaderboardOverview').then((mod) => mod.LeaderboardOverview),
  {
    ssr: false,
    loading: () => <LeaderboardSkeleton />,
  }
);

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

// Follow recommendations removed from sidebar

const NextStepsPanel = dynamic(
  () => import('./components/NextStepsPanel').then((mod) => mod.NextStepsPanel),
  {
    ssr: false,
    loading: () => null, // No loading state needed, component handles its own visibility
  }
);

const PersonalizeFeedBanner = dynamic(
  () => import('./components/PersonalizeFeedBanner').then((mod) => mod.PersonalizeFeedBanner),
  {
    ssr: false,
    loading: () => null,
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
    { name: 'Attila Karsi', authorUrl: '/author/984218' },
  ];

  // The specific paper URL from the request
  const paperUrl =
    'https://new.researchhub.com/paper/9324244/analysis-of-unique-genes-reveals-potential-role-of-essential-amino-acid-synthesis-pathway-in-flavobacterium-covae-virulence';

  return (
    <Link href={paperUrl} className="block">
      <div className="relative bg-white rounded-lg mb-4 border border-gray-200 hover:bg-gray-50 transition-colors duration-150 overflow-hidden cursor-pointer">
        <h2 className="absolute top-[-1px] left-[-1px] z-10 bg-primary-50 text-primary-600 rounded-lg py-2 px-4 text-sm font-medium flex items-center">
          <Icon name="rhJournal1" size={16} className="mr-1.5" color="#3971ff" />
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
            className="text-gray-500 font-normal [text-wrap:wrap]"
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

// Main RightSidebar Component - memoized to prevent re-renders when parent components change
const SidebarComponent = () => {
  const pathname = usePathname();
  const isFollowingPage = pathname === '/following';

  return (
    <div className="space-y-4">
      {/* Personalize Feed Banner - show logged-in variant on /following page */}
      <PersonalizeFeedBanner variant={isFollowingPage ? 'logged-in' : 'logged-out'} />

      {/* Next Steps Panel for new users */}
      {/* <NextStepsPanel /> */}

      <div className="bg-white rounded-lg p-2">
        {/* Dynamic Leaderboard Section */}
        <LeaderboardOverview />
      </div>

      {/* Follow recommendations removed */}
    </div>
  );
};

export const RightSidebar = memo(SidebarComponent);
RightSidebar.displayName = 'RightSidebar';
