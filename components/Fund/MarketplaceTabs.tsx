'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { Switch } from '@/components/ui/Switch';
import { ChevronDown, TrendingUp, ArrowUp, DollarSign, Users } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';

export type MarketplaceTab = 'grants' | 'needs-funding' | 'previously-funded';
export type FundingSortOption = '' | 'upvotes' | 'most_applicants' | 'amount_raised';

type SortOption = {
  label: string;
  value: FundingSortOption;
  icon: typeof TrendingUp | typeof ArrowUp | typeof DollarSign | typeof Users;
};

const getSortOptions = (activeTab: MarketplaceTab): SortOption[] => [
  { label: 'Best', value: '', icon: TrendingUp },
  { label: 'Top', value: 'upvotes', icon: ArrowUp },
  { label: 'Applicants', value: 'most_applicants', icon: Users },
  { label: activeTab === 'grants' ? 'Amount' : 'Raised', value: 'amount_raised', icon: DollarSign },
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
  includeEnded: boolean;
  onIncludeEndedChange: (includeEnded: boolean) => void;
}

export const MarketplaceTabs: FC<MarketplaceTabsProps> = ({
  activeTab,
  onTabChange,
  disableTabs,
  sortBy,
  onSortChange,
  includeEnded,
  onIncludeEndedChange,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sortOptions = getSortOptions(activeTab);

  const handleTabChange = (tabId: string) => {
    if (disableTabs) return;
    const tab = tabId as MarketplaceTab;

    // Create new URLSearchParams to modify query parameters
    const newParams = new URLSearchParams(searchParams.toString());

    // If switching to previously-funded tab, clear the sort parameter
    if (tab === 'previously-funded') {
      newParams.delete('sort');
      // Also call onSortChange to update the parent component's state
      onSortChange('');
    }

    const queryString = newParams.toString();
    router.push(queryString ? `${TAB_ROUTES[tab]}?${queryString}` : TAB_ROUTES[tab]);
    onTabChange(tab);
  };

  const { label, icon: CurrentIcon } =
    sortOptions.find((option) => option.value === sortBy) || sortOptions[0];

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
          {activeTab !== 'previously-funded' && (
            <BaseMenu
              align="end"
              trigger={
                <Button variant="outlined" size="sm" className="flex items-center gap-1 ml-[5px]">
                  <CurrentIcon className="h-4 w-4 mr-1" />
                  <span>{label}</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              }
            >
              {sortOptions.map(({ value, label: optionLabel, icon: OptionIcon }) => (
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
              <DropdownMenu.Separator className="my-1 h-px bg-gray-200" />
              <BaseMenuItem className="flex items-center justify-between">
                <span>Include ended</span>
                <Switch
                  checked={includeEnded}
                  onCheckedChange={onIncludeEndedChange}
                  className="h-4 w-7 [&>span]:h-3 [&>span]:w-3 [&>span]:translate-x-0 [&[aria-checked=true]>span]:translate-x-4 ml-5"
                />
              </BaseMenuItem>
            </BaseMenu>
          )}
        </div>
      </div>
    </div>
  );
};
