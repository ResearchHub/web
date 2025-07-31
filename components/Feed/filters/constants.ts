export interface Source {
  value: string;
  label: string;
  logo: string;
}

export const SOURCES: Source[] = [
  { value: 'biorxiv', label: 'bioRxiv', logo: '/logos/biorxiv.png' },
  { value: 'arxiv', label: 'arXiv', logo: '/logos/arxiv.png' },
  { value: 'medrxiv', label: 'medRxiv', logo: '/logos/medrxiv.jpg' },
  { value: 'chemrxiv', label: 'chemRxiv', logo: '/logos/chemrxiv.png' },
];

export const TIME_PERIODS = [
  { value: 'LAST_24H', label: 'Today', icon: 'Clock' },
  { value: 'LAST_3_DAYS', label: 'Last 3 Days', icon: 'Calendar' },
  { value: 'LAST_WEEK', label: 'This Week', icon: 'Calendar' },
  { value: 'LAST_MONTH', label: 'This Month', icon: 'TrendingUp' },
  { value: 'LAST_3_MONTHS', label: 'Last 3 Months', icon: 'Hash' },
];

export const SORT_OPTIONS = [
  { value: 'best', label: 'Best', icon: 'Sparkles' },
  { value: 'trending', label: 'Trending', icon: 'TrendingUp' },
  { value: 'newest', label: 'Newest', icon: 'Clock' },
];
