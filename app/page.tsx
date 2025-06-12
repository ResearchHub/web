'use client';

import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';
import { Suspense } from 'react';
import { useUser } from '@/contexts/UserContext';
import { LandingPage } from '@/components/landing/LandingPage';

function HomePageContent() {
  const { user, isLoading } = useUser();
  const defaultTab: FeedTab = 'popular';

  // Show loading state while checking authentication
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  // Show landing page for logged-out users
  if (!user) {
    return <LandingPage />;
  }

  // Show regular feed for logged-in users
  return (
    <>
      <Feed defaultTab={defaultTab} />
    </>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  );
}
