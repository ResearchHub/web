'use client';

import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';

export default function FollowingFeed() {
  const defaultTab: FeedTab = 'following';
  return <Feed defaultTab={defaultTab} />;
}
