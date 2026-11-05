import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

/**
 * A work's average review score, or undefined while it has none. A registered
 * report averages its own peer reviews; anything else takes the score the API
 * keeps, preferring the metadata's.
 */
export function getWorkReviewScore(work: Work, metadata?: WorkMetadata): number | undefined {
  const score =
    work.postType === 'REGISTERED_REPORT' ? averagePeerReviews(work) : apiScore(work, metadata);
  return score !== undefined && score > 0 ? score : undefined;
}

function averagePeerReviews(work: Work): number | undefined {
  const peerReviews = work.peerReviews ?? [];
  if (peerReviews.length === 0) return undefined;
  return peerReviews.reduce((total, review) => total + review.score, 0) / peerReviews.length;
}

function apiScore(work: Work, metadata?: WorkMetadata): number | undefined {
  const metadataScore = metadata?.metrics?.reviewScore;
  if (metadataScore && metadataScore > 0) return metadataScore;
  return work.metrics?.reviewScore;
}
