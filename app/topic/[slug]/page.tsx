import { TopicFeed } from '@/components/Feed/TopicFeed';
import { FeedTab } from '@/hooks/useFeed';

export default function TopicFeedPage() {
  const defaultTab: FeedTab = 'popular';
  return <TopicFeed defaultTab={defaultTab} />;
}
