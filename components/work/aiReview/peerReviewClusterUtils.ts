import type { MockReviewer, SubcategoryDefinition } from './types';
import type { PeerReviewAvatarClusterItem } from './PeerReviewAvatarCluster';

export function clusterItemsForSubcategory(
  sub: SubcategoryDefinition,
  reviewers: Record<string, MockReviewer>
): PeerReviewAvatarClusterItem[] {
  const raw: PeerReviewAvatarClusterItem[] = [];
  for (const c of sub.checklist) {
    for (const review of c.humanReviews) {
      const reviewer = reviewers[review.reviewerId];
      if (reviewer) raw.push({ review, reviewer });
    }
  }
  return dedupeClusterByReviewerPreferDispute(raw);
}

function dedupeClusterByReviewerPreferDispute(
  items: PeerReviewAvatarClusterItem[]
): PeerReviewAvatarClusterItem[] {
  const map = new Map<string, PeerReviewAvatarClusterItem>();
  for (const it of items) {
    const id = it.reviewer.id;
    const prev = map.get(id);
    if (!prev) {
      map.set(id, it);
      continue;
    }
    if (!it.review.agreesWithAi) {
      map.set(id, it);
    }
  }
  return [...map.values()];
}

export function clusterItemsForCategory(
  category: { subcategories: SubcategoryDefinition[] },
  reviewers: Record<string, MockReviewer>
): PeerReviewAvatarClusterItem[] {
  const raw: PeerReviewAvatarClusterItem[] = [];
  for (const sub of category.subcategories) {
    raw.push(...clusterItemsForSubcategory(sub, reviewers));
  }
  const byReviewer = new Map<string, PeerReviewAvatarClusterItem>();
  for (const it of raw) {
    const id = it.reviewer.id;
    const prev = byReviewer.get(id);
    if (!prev) {
      byReviewer.set(id, it);
    } else if (!it.review.agreesWithAi) {
      byReviewer.set(id, it);
    }
  }
  return [...byReviewer.values()];
}
