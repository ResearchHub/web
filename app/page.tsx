'use client';

import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';
import { Suspense } from 'react';

function HomePageContent() {
  const defaultTab: FeedTab = 'popular';
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
