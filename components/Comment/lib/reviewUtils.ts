import type { AuthorProfile } from '@/types/authorProfile';

/** The account the AI reviews are posted from. */
const AI_REVIEW_USER_ID = process.env.NEXT_PUBLIC_AI_REVIEW_USER_ID;

/**
 * Whether the ResearchHub Foundation's editors assessed and approved this review,
 * which the threads show as "Awarded". The AI reviewer's reviews never count, even
 * when assessed.
 */
export function isFoundationAssessedReview(
  isAssessed: boolean | undefined,
  author?: AuthorProfile
): boolean {
  const isAiReviewer =
    AI_REVIEW_USER_ID != null && String(author?.user?.id ?? '') === String(AI_REVIEW_USER_ID);
  return Boolean(isAssessed) && !isAiReviewer;
}
