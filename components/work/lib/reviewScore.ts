import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

/**
 * A work's average review score, or undefined while it has none. A registered
 * report averages its own peer reviews; anything else takes the score the API
 * keeps, preferring the metadata's.
 */
export function getWorkReviewScore(work: Work, metadata?: WorkMetadata): number | undefined {
  const peerReviews = work.peerReviews ?? [];
  const metadataScore = metadata?.metrics?.reviewScore;
  const score =
    work.postType === 'REGISTERED_REPORT'
      ? peerReviews.length > 0
        ? peerReviews.reduce((total, review) => total + review.score, 0) / peerReviews.length
        : undefined
      : metadataScore && metadataScore > 0
        ? metadataScore
        : work.metrics?.reviewScore;
  return score !== undefined && score > 0 ? score : undefined;
}
