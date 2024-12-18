'use client'

import { Settings } from "lucide-react";
import { Button } from "./ui/Button";
import { Tabs } from "./ui/Tabs";

interface FeedTabsProps {
  showingInterests: boolean;
  onInterestsClick: () => void;
  activeInterestTab?: 'journal' | 'person' | 'topic';
  onInterestTabChange?: (tab: 'journal' | 'person' | 'topic') => void;
  activeTab?: 'for-you' | 'following' | 'popular' | 'latest';
  onTabChange?: (tab: 'for-you' | 'following' | 'popular' | 'latest') => void;
}

const feedTabs = [
  { id: 'for-you', label: 'For You' },
  { id: 'following', label: 'Following' },
  { id: 'popular', label: 'Popular' },
  { id: 'latest', label: 'Latest' },
];

const interestTabs = [
  { id: 'journal', label: 'Journals' },
  { id: 'person', label: 'People' },
  { id: 'topic', label: 'Topics' },
];

export const FeedTabs: React.FC<FeedTabsProps> = ({ 
  showingInterests, 
  onInterestsClick,
  activeInterestTab = 'journal',
  onInterestTabChange = () => {},
  activeTab = 'for-you',
  onTabChange = () => {}
}) => {
  if (showingInterests) {
    return (
      <div className="transition-colors duration-200 -mx-4 px-4">
        <div className="border-b mb-6 w-full">
          <div className="flex justify-between items-center h-[52px]">
            <div className="flex items-center text-purple-600">
              <Settings className="w-5 h-5 mr-2" />
              <span className="font-medium">Customize Your Feed</span>
            </div>
            <Button 
              variant="ghost"
              onClick={onInterestsClick}
            >
              Back to Feed
            </Button>
          </div>
          <Tabs
            tabs={interestTabs}
            activeTab={activeInterestTab}
            onTabChange={(id) => onInterestTabChange(id as 'journal' | 'person' | 'topic')}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="transition-colors duration-200">
      <div className="flex items-center justify-between border-b">
        <Tabs
          tabs={feedTabs}
          activeTab={activeTab}
          onTabChange={(id) => onTabChange(id as 'for-you' | 'following' | 'popular' | 'latest')}
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={onInterestsClick}
          className="flex items-center gap-2 ml-4"
        >
          <Settings className="w-4 h-4" />
          Customize Feed
        </Button>
      </div>
    </div>
  );
}