import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'ResearchCoin (RSC)',
  description:
    'Track your ResearchCoin balance and transactions. Earn RSC by contributing to open science on ResearchHub.',
  url: '/researchcoin',
});

export default function ResearchCoinLayout({ children }: { children: React.ReactNode }) {
  return children;
}
