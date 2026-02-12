import { Metadata } from 'next';
import { LeaderboardContent } from '../components/LeaderboardContent';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Top Funders',
  description:
    'See top funders in the ResearchHub community. Explore who contributed the most RSC to fund scientific research.',
  url: '/leaderboard/funders',
  type: 'website',
});

export default function LeaderboardFundersPage() {
  return <LeaderboardContent defaultTab="funders" />;
}
