'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { Settings, ChevronLeft } from 'lucide-react';
import { FeedTab } from '@/hooks/useFeed';
import { useAuthenticatedAction } from '@/contexts/AuthModalContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/styles';

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  customAction?: () => void;
}

interface FeedTabsProps {
  activeTab: FeedTab;
  tabs: TabItem[];
  isCustomizing?: boolean;
  onTabChange: (tab: string) => void;
  onCustomizeChange?: () => void;
  isLoading?: boolean;
}

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  tabs,
  isCustomizing = false,
  onTabChange,
  onCustomizeChange,
  isLoading,
}) => {
  const { executeAuthenticatedAction } = useAuthenticatedAction();

  const handleTabChange = (tabId: string) => {
    if (isCustomizing) return;
    onTabChange(tabId);
  };

  const tooltipContent = (
    <div className="flex items-center gap-2">
      <Settings className="w-4 h-4" />
      <span>Customize your feed preferences</span>
    </div>
  );

  const handleCustomizeClick = () => {
    if (!isLoading && onCustomizeChange) {
      executeAuthenticatedAction(onCustomizeChange);
    }
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        {isCustomizing ? (
          <div className="flex items-center gap-2 flex-1 min-w-0 py-2">
            <Button
              variant="secondary"
              size="icon"
              onClick={handleCustomizeClick}
              disabled={isLoading}
              aria-label="Back to feed"
              className="shrink-0"
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <h2 className="text-base font-medium text-gray-800 truncate">Customize Feed</h2>
          </div>
        ) : (
          <>
            <Tabs
              tabs={tabs}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              disabled={isLoading}
            />
            {onCustomizeChange && (
              <Tooltip content={tooltipContent} position="bottom" delay={150}>
                <div
                  onClick={handleCustomizeClick}
                  role="button"
                  tabIndex={isLoading ? -1 : 0}
                  aria-disabled={isLoading}
                  aria-label="Customize feed"
                  className={cn(
                    'flex items-center gap-2 px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200',
                    'cursor-pointer',
                    'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200',
                    isLoading && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <Settings className="w-5 h-5" />
                  <span className="hidden md:inline">Customize</span>
                </div>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  );
};
