import { Metadata } from 'next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { ActivityPageContent } from '@/components/Activity';
import { JoinResearchHubBanner } from '@/components/banners/JoinResearchHubBanner';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Open Science Community & Research Platform',
  description:
    'ResearchHub is a collaborative platform for sharing, reviewing, and funding scientific research. Join the open science community.',
  url: '/',
});

export default function HomeActivityPage() {
  return (
    <>
      <ActivityPageContent />
      <JoinResearchHubBanner />
    </>
  );
}
