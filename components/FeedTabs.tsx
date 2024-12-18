'use client'

import { Plus } from "lucide-react";
import { Tabs } from "./ui/Tabs";

interface FeedTabsProps {
  showingInterests: boolean;
  onInterestsClick: () => void;
  activeTab: 'for-you' | 'following' | 'popular' | 'latest' | 'add-interests';
  onTabChange: (tab: 'for-you' | 'following' | 'popular' | 'latest' | 'add-interests') => void;
}

const feedTabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'popular', label: 'Popular' },
  { id: 'latest', label: 'Latest' },
  { 
    id: 'add-interests', 
    label: 'Add Interests',
    separator: true,
    icon: Plus
  },
];

export const FeedTabs: React.FC<FeedTabsProps> = ({ 
  showingInterests, 
  onInterestsClick,
  activeTab,
  onTabChange
}) => {
  const handleTabChange = (id: string) => {
    if (id === 'add-interests') {
      onInterestsClick();
      onTabChange('add-interests');
    } else {
      if (showingInterests) {
        onInterestsClick();
      }
      onTabChange(id as 'for-you' | 'following' | 'popular' | 'latest');
    }
  };

  return (
    <div className="transition-colors duration-200">
      <div className="w-full border-b">
        <Tabs
          tabs={feedTabs}
          activeTab={showingInterests ? 'add-interests' : activeTab}
          onTabChange={handleTabChange}
        />
      </div>
    </div>
  );
}