import { getServerSession } from 'next-auth/next';
import { handleTrendingRedirect } from '@/utils/navigation';
import { LandingPage } from '@/components/landing/LandingPage';
import { headers } from 'next/headers';
import { ExperimentVariant } from '@/utils/experiment';

// This can be a server component
export default async function Home() {
  // Get session on the server
  const session = await getServerSession();

  // Get experiment variant from middleware
  const headersList = await headers();
  const experimentVariant = headersList.get('x-homepage-experiment');

  // If user is logged in, redirect to trending page
  handleTrendingRedirect(!!session?.user, experimentVariant as ExperimentVariant | null);

  // If no user is logged in, show the landing page
  return <LandingPage />;
}
