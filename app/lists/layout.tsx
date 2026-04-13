import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Your Lists',
  description: 'Browse and create curated lists of scientific research papers on ResearchHub.',
  url: '/lists',
});

export default function ListsLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
