import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Popular',
  description:
    'Discover trending scientific research, papers, and discussions on ResearchHub. See what the community is reading and discussing.',
  url: '/popular',
});

export default function PopularLayout({ children }: { children: React.ReactNode }) {
  return children;
}
