'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { ChevronDown, Star, TrendingUp, ArrowUp, DollarSign, Clock } from 'lucide-react';

export type MarketplaceTab = 'grants' | 'needs-funding' | 'previously-funded';
export type FundingSortOption = '' | 'hot_score' | 'upvotes' | 'amount_raised' | 'newest';

type SortOption = {
  label: string;
  value: FundingSortOption;
  icon: typeof Star | typeof TrendingUp | typeof ArrowUp | typeof DollarSign | typeof Clock;
};

const SORT_OPTIONS: SortOption[] = [
  { label: 'Best', value: '', icon: Star },
  { label: 'Score', value: 'hot_score', icon: TrendingUp },
  { label: 'Top', value: 'upvotes', icon: ArrowUp },
  { label: 'Raised', value: 'amount_raised', icon: DollarSign },
  { label: 'Newest', value: 'newest', icon: Clock },
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
    const route = TAB_ROUTES[tab];

    router.push(queryString ? `${route}?${queryString}` : route);
    onTabChange(tab);
  };

  const currentOption = SORT_OPTIONS.find((option) => option.value === sortBy) || SORT_OPTIONS[0];
  const CurrentIcon = currentOption.icon;

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
                <span>{currentOption.label}</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            }
          >
            {SORT_OPTIONS.map(({ value, label, icon: OptionIcon }) => (
              <BaseMenuItem
                key={value || 'best'}
                onClick={() => onSortChange(value)}
                className={sortBy === value ? 'bg-gray-100' : ''}
              >
                <div className="flex items-center gap-2">
                  <OptionIcon className="h-4 w-4" />
                  <span>{label}</span>
                </div>
              </BaseMenuItem>
            ))}
          </BaseMenu>
        </div>
      </div>
    </div>
  );
};
