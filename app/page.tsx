'use client';

import Feed from '@/components/Feed/Feed';
import { FeedTab } from '@/hooks/useFeed';

export default function Home() {
  const defaultTab: FeedTab = 'popular';
  return <Feed defaultTab={defaultTab} />;
}
