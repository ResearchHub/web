import { redirect } from 'next/navigation';
import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Leaderboard',
  description:
    'See top contributors in the ResearchHub community. Explore top peer reviewers and funders who help accelerate scientific research.',
  url: '/leaderboard/funders',
  type: 'website',
});

export default function LeaderboardPage() {
  redirect('/leaderboard/funders');
}
