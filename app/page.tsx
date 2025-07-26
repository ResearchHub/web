import { getServerSession } from 'next-auth/next';
import { handleTrendingRedirect } from '@/utils/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { headers } from 'next/headers';
import { ExperimentVariant } from '@/utils/experiment';

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
    homepageExperimentVariant as ExperimentVariant | null,
    urlSearchParams
  );

  return <LandingPage />;
}
