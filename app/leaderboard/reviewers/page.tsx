import { Suspense } from 'react';
import { Metadata } from 'next';
import { LeaderboardContent } from '../components/LeaderboardContent';
import { LeaderboardListSkeleton } from '../components/LeaderboardListSkeleton';
import { ChartNoAxesColumnIncreasing } from 'lucide-react';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Top Peer Reviewers',
  description:
    'See top peer reviewers in the ResearchHub community. Explore who earned the most RSC for reviewing and improving scientific research.',
  url: '/leaderboard/reviewers',
  type: 'website',
});

export default function LeaderboardReviewersPage() {
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
      <LeaderboardContent defaultTab="reviewers" />
    </Suspense>
  );
}
