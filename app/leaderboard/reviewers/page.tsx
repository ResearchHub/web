import { Metadata } from 'next';
import { LeaderboardContent } from '../components/LeaderboardContent';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Top Peer Reviewers',
  description:
    'See top peer reviewers in the ResearchHub community. Explore who earned the most RSC for reviewing and improving scientific research.',
  url: '/leaderboard/reviewers',
  type: 'website',
});

export default function LeaderboardReviewersPage() {
  return <LeaderboardContent defaultTab="reviewers" />;
}
