import { getServerSession } from 'next-auth/next';
import { handleTrendingRedirect } from '@/utils/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { headers } from 'next/headers';
import { ExperimentVariant } from '@/utils/experiment';

// This can be a server component
export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Get session on the server
  const session = await getServerSession();

  // Get experiment variant from middleware
  const headersList = await headers();
  const experimentVariant = headersList.get('x-homepage-experiment');

  // Await searchParams before using them
  const resolvedSearchParams = await searchParams;

  // Convert searchParams to URLSearchParams for the redirect function
  const urlSearchParams = new URLSearchParams();
  Object.entries(resolvedSearchParams).forEach(([key, value]) => {
    if (typeof value === 'string') {
      urlSearchParams.set(key, value);
    } else if (Array.isArray(value)) {
      // Handle array values by taking the first one
      if (value.length > 0) {
        urlSearchParams.set(key, value[0]);
      }
    }
  });

  // If user is logged in, redirect to trending page
  handleTrendingRedirect(
    !!session?.user,
    experimentVariant as ExperimentVariant | null,
    urlSearchParams
  );

  // If no user is logged in, show the landing page
  return <LandingPage />;
}
