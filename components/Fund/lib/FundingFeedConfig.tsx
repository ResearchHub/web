import { ReactNode } from 'react';
import { MarketplaceTab, FundingSortOption } from '../MarketplaceTabs';
import { Clock, Star, ArrowUp, DollarSign, Users } from 'lucide-react';

export type SortOption = {
  label: string;
  value: FundingSortOption;
  icon: typeof Clock | typeof Star | typeof ArrowUp | typeof DollarSign | typeof Users;
};

export const getSortOptions = (activeTab: MarketplaceTab): SortOption[] => {
  const allOptions: SortOption[] = [
    { label: 'Best', value: 'best', icon: Star },
    { label: 'Newest', value: 'newest', icon: Clock },
    { label: 'Most upvoted', value: 'upvotes', icon: ArrowUp },
    {
      label: activeTab === 'grants' ? 'Most applicants' : 'Most funders',
      value: 'most_applicants',
      icon: Users,
    },
    {
      label: activeTab === 'grants' ? 'Amount' : 'Raised',
      value: 'amount_raised',
      icon: DollarSign,
    },
  ];

  // Hide "Best" option on the RFPs (grants) tab
  if (activeTab === 'grants') {
    return allOptions.filter((option) => option.value !== 'best');
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
  FundRightSidebar: ReactNode
): Record<MarketplaceTab, TabConfig> => ({
  grants: {
    title: 'Request for Proposals',
    subtitle: 'Explore available funding opportunities',
    contentType: 'GRANT',
    endpoint: 'grant_feed',
    sidebar: GrantRightSidebar,
    fundraiseStatus: undefined,
  },
  'needs-funding': {
    title: 'Proposals',
    subtitle: 'Fund breakthrough research shaping tomorrow',
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    sidebar: FundRightSidebar,
    fundraiseStatus: 'OPEN',
  },
  'previously-funded': {
    title: 'Previously Funded',
    subtitle: 'Browse research that has been successfully funded',
    contentType: 'PREREGISTRATION',
    endpoint: 'funding_feed',
    sidebar: FundRightSidebar,
    fundraiseStatus: 'CLOSED',
  },
});
