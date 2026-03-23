export type ProposalStatusFilter = 'all' | 'open' | 'completed';
export type ProposalSortOption =
  | 'best'
  | 'newest'
  | 'upvotes'
  | 'most_applicants'
  | 'amount_raised'
  | 'completed';

export const STATUS_OPTIONS: { label: string; value: ProposalStatusFilter }[] = [
  { label: 'All proposals', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Ended', value: 'completed' },
];

export const SORT_OPTIONS: { label: string; value: ProposalSortOption }[] = [
  { label: 'Best', value: 'best' },
  { label: 'Newest', value: 'newest' },
  { label: 'Most upvoted', value: 'upvotes' },
  { label: 'Most funders', value: 'most_applicants' },
  { label: 'Raised', value: 'amount_raised' },
  { label: 'Completed', value: 'completed' },
];
