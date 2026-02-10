import { Suspense } from 'react';
import { Metadata } from 'next';
import { LeaderboardContent } from '../components/LeaderboardContent';
import { LeaderboardListSkeleton } from '../components/LeaderboardListSkeleton';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Top Funders',
  description:
    'See top funders in the ResearchHub community. Explore who contributed the most RSC to fund scientific research.',
  url: '/leaderboard/funders',
  type: 'website',
});

export default function LeaderboardFundersPage() {
  return (
    <Suspense
      fallback={
        <div className="px-0 py-8 max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <ChartNoAxesColumnIncreasing size={28} />
            ResearchHub Leaderboard
          </h1>
          <p className="text-gray-600 mb-6">
            See the most active contributors on ResearchHub for the selected time period.
          </p>
          <LeaderboardListSkeleton />
        </div>
      }
    >
      <LeaderboardContent defaultTab="funders" />
    </Suspense>
  );
}
