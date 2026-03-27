export type GrantSortOption = 'most_applicants' | 'newest' | 'amount_raised';

export const GRANT_SORT_OPTIONS: { label: string; value: GrantSortOption }[] = [
  { label: 'Most proposals', value: 'most_applicants' },
  { label: 'Newest', value: 'newest' },
  { label: 'Highest amount', value: 'amount_raised' },
];
