'use client';

/**
 * "Pending Review" pill shown in a work's header eyebrow while it awaits
 * moderator approval. Used for papers, posts, and proposals (driven by
 * `work.moderationStatus`) and for grants (driven by `grant.status`).
 */
export function PendingReviewBadge() {
  return (
    <span className="inline-flex items-center font-medium text-xs sm:text-sm px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md text-yellow-700 bg-yellow-100">
      Pending Review
    </span>
  );
}
