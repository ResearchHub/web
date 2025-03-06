import { FundingRequest } from '@/types/feed';
import { ContentMetrics } from '@/types/metrics';
import { FeedItem } from './FeedItem';

interface FundingRequestCardProps {
  content: FundingRequest;
  metrics: ContentMetrics;
}

export function FundingRequestCard({ content, metrics }: FundingRequestCardProps) {
  // Create a feed entry from the funding request
  const feedEntry = {
    id: content.id,
    action: 'publish',
    timestamp: content.deadline || new Date().toISOString(),
    content,
    metrics,
  };

  return <FeedItem entry={feedEntry} />;
}
