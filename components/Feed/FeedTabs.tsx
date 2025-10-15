'use client';

import { FC } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { FeedTab } from '@/hooks/useFeed';
import { useRouter } from 'next/navigation';

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
}

export const FeedTabs: FC<FeedTabsProps> = ({
  activeTab,
  tabs,
  onTabChange,
  isLoading,
  isModerator = false,
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
      </div>
    </div>
  );
};
