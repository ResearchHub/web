import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Following',
  description:
    'Research papers and discussions from scientists and topics you follow on ResearchHub.',
  url: '/following',
});

export default function FollowingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
