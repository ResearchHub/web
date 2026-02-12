import { ReactNode } from 'react';
import { Metadata } from 'next';
import { PageLayout } from '@/app/layouts/PageLayout';
import { buildOpenGraphMetadata } from '@/lib/metadata';

interface LeaderboardLayoutProps {
  children: ReactNode;
}

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Leaderboard',
  description:
    'See top contributors in the ResearchHub community. Explore top peer reviewers and funders who help accelerate scientific research.',
  url: '/leaderboard/funders',
  type: 'website',
});

export default function LeaderboardLayout({ children }: LeaderboardLayoutProps) {
  return <PageLayout rightSidebar={false}>{children}</PageLayout>;
}
