'use client';

import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';

export default function LatestFeed() {
  const defaultTab: FeedTab = 'latest';
  return <Feed defaultTab={defaultTab} />;
}
