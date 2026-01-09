export interface ReviewAvailability {
  canReview: boolean;
  availableAt: string | null;
}

export interface ApiReviewAvailability {
  can_review: boolean;
  available_at: string | null;
}

export const transformReviewAvailability = (raw: ApiReviewAvailability): ReviewAvailability => ({
  canReview: raw.can_review,
  availableAt: raw.available_at,
});
