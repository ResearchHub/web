'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { useRouter, useSearchParams } from 'next/navigation';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { Button } from '@/components/ui/Button';
import { ChevronDown } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { useIsMobile } from '@/hooks/useIsMobile';
import { getSortOptions } from './lib/FundingFeedConfig';

export type MarketplaceTab = 'grants' | 'needs-funding';
export type FundingSortOption =
  | ''
  | 'best'
  | 'upvotes'
  | 'most_applicants'
  | 'amount_raised'
  | 'ended';

const getTabs = (isMobile: boolean) => [
  { id: 'grants' as const, label: isMobile ? 'RFPs' : 'Request for Proposals' },
  { id: 'needs-funding' as const, label: 'Proposals' },
];

const TAB_ROUTES: Record<MarketplaceTab, string> = {
  grants: '/fund/grants',
  'needs-funding': '/fund/needs-funding',
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
  const isMobile = useIsMobile();
  const sortOptions = getSortOptions(activeTab);
  const tabs = getTabs(isMobile);

  const handleTabChange = (tabId: string) => {
    if (disableTabs) return;
    const tab = tabId as MarketplaceTab;

    // Preserve existing parameters when switching tabs
    const newParams = new URLSearchParams(searchParams.toString());
    const queryString = newParams.toString();
    router.push(queryString ? `${TAB_ROUTES[tab]}?${queryString}` : TAB_ROUTES[tab]);
    onTabChange(tab);
  };

  const { label, icon: CurrentIcon } =
    sortOptions.find((option) => option.value === sortBy) || sortOptions[0];

  return (
    <div className="bg-white pb-6">
      <div className="full-w border-b border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              variant="primary"
              className="border-b-0"
              disableOverflow={true}
            />
          </div>
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
          </BaseMenu>
        </div>
      </div>
    </div>
  );
};
