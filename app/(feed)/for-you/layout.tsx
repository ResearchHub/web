import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'For You',
  description:
    'Your personalized feed of scientific research, papers, and discussions based on your interests.',
  url: '/for-you',
});

export default function ForYouLayout({ children }: { children: React.ReactNode }) {
  return children;
}
