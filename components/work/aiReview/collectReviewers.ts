import type { CategoryDefinition, ChecklistItemDefinition, MockReviewer } from './types';

export function collectReviewerIdsForChecklistItem(item: ChecklistItemDefinition): string[] {
  return [...new Set(item.humanReviews.map((h) => h.reviewerId))];
}

export function mergeReviewerIds(...lists: string[][]): string[] {
  return [...new Set(lists.flat())];
}

export function collectReviewerIdsForSubcategory(sub: {
  checklist: ChecklistItemDefinition[];
}): string[] {
  return mergeReviewerIds(...sub.checklist.map(collectReviewerIdsForChecklistItem));
}

export function collectReviewerIdsForCategory(category: CategoryDefinition): string[] {
  return mergeReviewerIds(
    ...category.subcategories.map((s) => collectReviewerIdsForSubcategory(s))
  );
}

export function collectReviewerIdsForCategories(categories: CategoryDefinition[]): string[] {
  return mergeReviewerIds(...categories.map(collectReviewerIdsForCategory));
}

export function reviewersFromIds(
  ids: string[],
  byId: Record<string, MockReviewer>
): MockReviewer[] {
  return ids.map((id) => byId[id]).filter(Boolean);
}

export function collectChecklistIdsForCategory(category: CategoryDefinition): string[] {
  return category.subcategories.flatMap((s) => s.checklist.map((c) => c.id));
}

export function categoryHasUserValidation(
  category: CategoryDefinition,
  userValidations: Record<string, unknown>
): boolean {
  const ids = new Set(collectChecklistIdsForCategory(category));
  return Object.keys(userValidations).some((k) => ids.has(k));
}
