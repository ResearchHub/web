'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { ChevronDown, TrendingUp, ArrowUp, DollarSign, Clock } from 'lucide-react';

export type MarketplaceTab = 'grants' | 'needs-funding' | 'previously-funded';
export type FundingSortOption = '' | 'hot_score' | 'upvotes' | 'amount_raised';

type SortOption = {
  label: string;
  value: FundingSortOption;
  icon: typeof TrendingUp | typeof ArrowUp | typeof DollarSign | typeof Clock;
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Best', value: 'hot_score', icon: TrendingUp },
  { label: 'Top', value: 'upvotes', icon: ArrowUp },
  { label: 'Raised', value: 'amount_raised', icon: DollarSign },
  { label: 'Newest', value: '', icon: Clock },
];

const TABS = [
  { id: 'grants' as const, label: 'Request for Proposals' },
  { id: 'needs-funding' as const, label: 'Proposals' },
  { id: 'previously-funded' as const, label: 'Previously Funded' },
];

const TAB_ROUTES: Record<MarketplaceTab, string> = {
  grants: '/fund/grants',
  'needs-funding': '/fund/needs-funding',
  'previously-funded': '/fund/previously-funded',
};

interface MarketplaceTabsProps {
  activeTab: MarketplaceTab;
  onTabChange: (tab: MarketplaceTab) => void;
  disableTabs?: boolean;
  sortBy: FundingSortOption;
  onSortChange: (sort: FundingSortOption) => void;
}

export const MarketplaceTabs: FC<MarketplaceTabsProps> = ({
  activeTab,
  onTabChange,
  disableTabs,
  sortBy,
  onSortChange,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleTabChange = (tabId: string) => {
    if (disableTabs) return;
    const tab = tabId as MarketplaceTab;
    const queryString = searchParams.toString();
    router.push(queryString ? `${TAB_ROUTES[tab]}?${queryString}` : TAB_ROUTES[tab]);
    onTabChange(tab);
  };

  const { label, icon: CurrentIcon } =
    SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0];

  return (
    <div className="bg-white pb-6">
      <div className="full-w border-b border-gray-200">
        <div className="flex items-center justify-between">
          <Tabs
            tabs={TABS}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            variant="primary"
            className="border-b-0"
          />
          <BaseMenu
            align="end"
            trigger={
              <Button variant="outlined" size="sm" className="flex items-center gap-1">
                <CurrentIcon className="h-4 w-4 mr-1" />
                <span>{label}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          >
            {SORT_OPTIONS.map(({ value, label: optionLabel, icon: OptionIcon }) => (
              <BaseMenuItem
                key={value || 'newest'}
                onClick={() => onSortChange(value)}
                className={sortBy === value ? 'bg-gray-100' : ''}
              >
                <div className="flex items-center gap-2">
                  <OptionIcon className="h-4 w-4" />
                  <span>{optionLabel}</span>
                </div>
              </BaseMenuItem>
            ))}
          </BaseMenu>
        </div>
      </div>
    </div>
  );
};
