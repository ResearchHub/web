'use client';

import { TopicFeed } from '@/components/Feed/TopicFeed';
import { FeedTab } from '@/hooks/useFeed';

export default function TopicLatestPage() {
  const defaultTab: FeedTab = 'latest';
  return <TopicFeed defaultTab={defaultTab} />;
}
