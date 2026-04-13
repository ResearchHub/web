import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Latest Feed',
  description:
    'Browse the latest scientific research, papers, and discussions shared on ResearchHub.',
  url: '/latest',
});

export default function LatestLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
