'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';
import { useRouter } from 'next/navigation';
import { Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface TabItem {
  id: string;
  label: string | React.ReactNode;
  customAction?: () => void;
}

interface FeedTabsProps {
  activeTab: FeedTab;
  tabs: TabItem[];
  onTabChange: (tab: string) => void;
  isLoading?: boolean;
  isModerator?: boolean;
  showGearIcon?: boolean;
  onGearClick?: () => void;
}

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  tabs,
  onTabChange,
  isLoading,
  isModerator = false,
  showGearIcon = false,
  onGearClick,
}) => {
  const router = useRouter();

  const handleTabChange = (tabId: string) => {
    onTabChange(tabId);
  };

  const handleV2Click = () => {
    router.push('/feed');
  };

  return (
    <div className="">
      <div className="flex items-center justify-between">
        {/* Create a modified tabs array with V2 option for moderators only */}
        <Tabs
          tabs={[
            ...tabs,
            ...(isModerator
              ? [
                  {
                    id: 'v2',
                    label: (
                      <div className="flex items-center gap-2">
                        <span>V2</span>
                        <span className="px-1.5  text-[8px] font-bold bg-blue-100 text-blue-600 rounded-full uppercase">
                          Beta
                        </span>
                      </div>
                    ),
                    onClick: handleV2Click,
                  },
                ]
              : []),
          ]}
          activeTab={activeTab}
          onTabChange={(tabId) => {
            if (tabId === 'v2') {
              handleV2Click();
            } else {
              handleTabChange(tabId);
            }
          }}
          disabled={isLoading}
        />
        {/* Edit topics button */}
        {showGearIcon && onGearClick && (
          <Button
            onClick={onGearClick}
            variant="ghost"
            size="sm"
            className="ml-3 whitespace-nowrap bg-gray-50 hover:bg-gray-100"
            aria-label="Edit topics"
          >
            <Edit3 className="w-4 h-4" />
            <span className="ml-2">Edit topics</span>
          </Button>
        )}
      </div>
    </div>
  );
};
