export type DocumentFeedSortOption = 'hot_score_v2' | 'latest' | 'best';

export const SORT_OPTIONS: { label: string; value: DocumentFeedSortOption }[] = [
  { label: 'Best', value: 'best' },
  { label: 'Latest', value: 'latest' },
];
