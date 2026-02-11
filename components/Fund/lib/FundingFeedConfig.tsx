import { ReactNode } from 'react';
import { MarketplaceTab, FundingSortOption } from '../MarketplaceTabs';
import { Clock, Star, ArrowUp, DollarSign, Users, CheckCircle } from 'lucide-react';

export type SortOption = {
  label: string;
  value: FundingSortOption;
  icon:
    | typeof Clock
    | typeof Star
    | typeof ArrowUp
    | typeof DollarSign
    | typeof Users
    | typeof CheckCircle;
};

export const getSortOptions = (activeTab: MarketplaceTab): SortOption[] => {
  const allOptions: SortOption[] = [
    { label: 'Best', value: 'best', icon: Star },
    {
      label: 'Newest',
      value: activeTab === 'needs-funding' || activeTab === 'all' ? 'newest' : '',
      icon: Clock,
    },
    { label: 'Most upvoted', value: 'upvotes', icon: ArrowUp },
    {
      label: activeTab === 'opportunities' ? 'Most applicants' : 'Most funders',
      value: 'most_applicants',
      icon: Users,
    },
    {
      label: activeTab === 'opportunities' ? 'Amount' : 'Raised',
      value: 'amount_raised',
      icon: DollarSign,
    },
    { label: 'Completed', value: 'completed', icon: CheckCircle },
  ];

  // Hide "Best" and "Completed" options on the opportunities tab
  if (activeTab === 'opportunities') {
    return allOptions.filter((option) => option.value !== 'best' && option.value !== 'completed');
  }

  return allOptions;
};

export type TabConfig = {
  title: string;
  subtitle: string;
  contentType: 'GRANT' | 'PREREGISTRATION';
  endpoint: 'grant_feed' | 'funding_feed';
  sidebar: ReactNode;
  fundraiseStatus?: 'OPEN' | 'CLOSED';
};

// This will be populated with actual sidebar components when imported
export const createTabConfig = (
  GrantRightSidebar: ReactNode,
  FundRightSidebar: ReactNode,
  AllFundingRightSidebar: ReactNode
): Record<MarketplaceTab, TabConfig> => ({
  all: {
    title: 'Funding',
    subtitle: 'Explore all funding opportunities and proposals',
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    sidebar: AllFundingRightSidebar,
    fundraiseStatus: 'OPEN',
  },
  opportunities: {
    title: 'Funding Opportunities',
    subtitle: 'Explore available funding opportunities',
    contentType: 'GRANT',
    endpoint: 'grant_feed',
    sidebar: GrantRightSidebar,
    fundraiseStatus: undefined,
  },
  'needs-funding': {
    title: 'Research Proposals',
    subtitle: 'Fund breakthrough research shaping tomorrow',
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    sidebar: FundRightSidebar,
    fundraiseStatus: 'OPEN',
  },
});
