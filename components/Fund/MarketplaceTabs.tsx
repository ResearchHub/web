'use client';

import { FC } from 'react';
import { cn } from '@/utils/styles';
import { Clock, CheckCircle2, ChevronDown } from 'lucide-react';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { Tabs } from '@/components/ui/Tabs';

export type MarketplaceTab = 'grants' | 'needs-funding';
export type FundingStatus = 'open' | 'completed';

interface MarketplaceTabsProps {
  activeTab: MarketplaceTab;
  onTabChange: (tab: MarketplaceTab) => void;
  fundingStatus: FundingStatus;
  onStatusChange: (status: FundingStatus) => void;
}

export const MarketplaceTabs: FC<MarketplaceTabsProps> = ({
  activeTab,
  onTabChange,
  fundingStatus,
  onStatusChange,
}) => {
  const tabs = [
    {
      id: 'needs-funding',
      label: 'Needs Funding',
    },
    {
      id: 'grants',
      label: 'Grants',
    },
  ];

  const statusOptions = [
    {
      id: 'open' as FundingStatus,
      label: 'Open',
      icon: Clock,
    },
    {
      id: 'completed' as FundingStatus,
      label: 'Completed',
      icon: CheckCircle2,
    },
  ];

  const activeStatusOption = statusOptions.find((option) => option.id === fundingStatus);

  return (
    <div className="bg-white pb-6">
      <div className="flex items-end justify-between border-b border-gray-200">
        {/* Left side - Main tabs */}
        <div className="flex-1">
          <Tabs
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={(tabId) => onTabChange(tabId as MarketplaceTab)}
            variant="underline"
            className="border-b-0"
          />
        </div>

        {/* Right side - Status dropdown (only for needs-funding) */}
        {activeTab === 'needs-funding' && (
          <div className="flex items-center space-x-2 ml-8 pb-3">
            <Dropdown
              trigger={
                <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                  {activeStatusOption && <activeStatusOption.icon className="w-4 h-4" />}
                  <span>{activeStatusOption?.label}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>
              }
              align="right"
            >
              {statusOptions.map((option) => {
                const Icon = option.icon;
                return (
                  <DropdownItem
                    key={option.id}
                    onClick={() => onStatusChange(option.id)}
                    className={cn(
                      'flex items-center space-x-2',
                      fundingStatus === option.id && 'bg-indigo-50 text-indigo-700'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{option.label}</span>
                  </DropdownItem>
                );
              })}
            </Dropdown>
          </div>
        )}
      </div>
    </div>
  );
};
