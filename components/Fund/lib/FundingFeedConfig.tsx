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
      value: activeTab === 'needs-funding' ? 'newest' : '',
      icon: Clock,
    },
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
    { label: 'Completed', value: 'completed', icon: CheckCircle },
  ];

  if (activeTab === 'grants') {
    return allOptions.filter((option) => option.value !== 'best' && option.value !== 'completed');
  }

  return allOptions;
};
