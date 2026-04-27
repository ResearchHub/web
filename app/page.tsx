import { Metadata } from 'next';
import { getServerSession } from 'next-auth/next';
import { buildOpenGraphMetadata } from '@/lib/metadata';
import { handleTrendingRedirect } from '@/utils/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { headers } from 'next/headers';
import { ExperimentVariant } from '@/utils/experiment';

export const metadata: Metadata = buildOpenGraphMetadata({
  title: 'Open Science Community & Research Platform',
  description:
    'ResearchHub is a collaborative platform for sharing, reviewing, and funding scientific research. Join the open science community.',
  url: '/',
});

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await getServerSession();

  const headersList = await headers();
  const homepageExperimentVariant = headersList.get('x-homepage-experiment');

  const resolvedSearchParams = await searchParams;

  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    } else if (Array.isArray(value)) {
      if (value.length > 0) {
        urlSearchParams.set(key, value[0]);
      }
    }
  });

  handleTrendingRedirect(
    !!session?.user,
    urlSearchParams,
    homepageExperimentVariant as ExperimentVariant | null
  );

  return <LandingPage />;
}
