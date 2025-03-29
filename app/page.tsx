// Server component - no 'use client' directive

import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';
import { FeedService } from '@/services/feed.service';

export const revalidate = 1800; // 30 minutes in seconds

// This function runs on the server at build time and whenever revalidation occurs
export async function generateStaticParams() {
  return [{}]; // Just a single page to generate
}

export default async function Home() {
  // Prefetch the feed data on the server
  const defaultTab: FeedTab = 'popular';
  const feedData = await FeedService.getFeed({
    page: 1,
    pageSize: 20,
    feedView: defaultTab,
    source: 'all',
  });

  return <Feed defaultTab={defaultTab} initialFeedData={feedData} />;
}
