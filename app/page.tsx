import { getServerSession } from 'next-auth/next';
import { FeedTab } from '@/hooks/useFeed';
import { handleTradingRedirect } from '@/utils/navigation';
import { LandingPage } from '@/components/landing/LandingPage';

// This can be a server component
export default async function Home() {
  // Get session on the server
  const session = await getServerSession();

  // If user is logged in, redirect to trending page
  handleTradingRedirect(!!session?.user);

  // If no user is logged in, show the landing page
  return <LandingPage />;
}
