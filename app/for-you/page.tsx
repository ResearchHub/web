'use client';

import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';

export default function ForYouFeed() {
  const defaultTab: FeedTab = 'for-you';
  return <Feed defaultTab={defaultTab} />;
}
