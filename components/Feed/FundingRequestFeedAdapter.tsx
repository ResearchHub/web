/**
 * FundingRequestFeedAdapter.tsx
 *
 * This component serves as an adapter/bridge that enables funding requests to be
 * displayed consistently in both the main feed and the dedicated funding page.
 *
 * Key functions:
 * 1. Converts standalone FundingRequest objects into the FeedEntry structure
 *    needed by the FeedItem component
 * 2. Ensures consistent rendering by using the same FeedItemBody component
 *    that the main feed uses
 * 3. Makes funding requests compatible with the general feed infrastructure
 *    while preserving their specialized rendering
 */

import { FundingRequest } from '@/types/feed';
import { ContentMetrics } from '@/types/metrics';
import { FeedItem } from './FeedItem';
import { FeedItemBody } from './FeedItemBody';

interface FundingRequestFeedAdapterProps {
  content: FundingRequest;
  metrics: ContentMetrics;
}

/**
 * Adapter component that transforms a standalone FundingRequest into a format
 * compatible with the general feed infrastructure, while maintaining specialized
 * rendering for funding requests.
 *
 * Used in:
 * - Funding page (/app/fund/page.tsx) to display funding requests in a consistent way
 * - Can potentially be used anywhere a FundingRequest needs to be displayed
 *   with the same UI as in the main feed
 */
export function FundingRequestFeedAdapter({ content, metrics }: FundingRequestFeedAdapterProps) {
  // Ensure the image is set to the animated logo if not available
  const contentWithImage = {
    ...content,
    image: content.image || '/Animated-Logo-v4.gif',
  };

  // Create a synthetic feed entry from the funding request
  // This transforms the standalone FundingRequest into the FeedEntry structure
  // that the FeedItem component expects
  const feedEntry = {
    id: contentWithImage.id,
    action: 'publish',
    timestamp: contentWithImage.deadline || new Date().toISOString(),
    content: contentWithImage,
    metrics,
  };

  // Create a custom body component to ensure the funding request is rendered correctly
  // This uses the same FeedItemBody component that renders content in the main feed,
  // ensuring consistency in appearance and behavior
  const customBody = (
    <FeedItemBody content={contentWithImage} metrics={metrics} hideTypeLabel={false} />
  );

  // Pass the synthetic feed entry and custom body to the FeedItem component
  // This allows the funding request to be displayed with the same layout and actions
  // as items in the main feed
  return <FeedItem entry={feedEntry} customBody={customBody} />;
}
