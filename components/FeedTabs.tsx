'use client'

import { Settings } from "lucide-react";

interface FeedTabsProps {
  showingInterests: boolean;
  onInterestsClick: () => void;
  activeInterestTab?: 'journal' | 'person' | 'topic';
  onInterestTabChange?: (tab: 'journal' | 'person' | 'topic') => void;
  activeTab?: 'for-you' | 'following' | 'popular' | 'latest';
  onTabChange?: (tab: 'for-you' | 'following' | 'popular' | 'latest') => void;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({ 
  showingInterests, 
  onInterestsClick,
  activeInterestTab,
  onInterestTabChange,
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
            <button 
              onClick={onInterestsClick}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2"
            >
              <span className="text-sm">Back to Feed</span>
            </button>
          </div>
          <div className="flex space-x-8">
            <button 
              onClick={() => onInterestTabChange?.('journal')}
              className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeInterestTab === 'journal' 
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Journals
            </button>
            <button 
              onClick={() => onInterestTabChange?.('person')}
              className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeInterestTab === 'person' 
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              People
            </button>
            <button 
              onClick={() => onInterestTabChange?.('topic')}
              className={`px-1 py-4 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeInterestTab === 'topic' 
                  ? 'text-purple-600 border-purple-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700'
              }`}
            >
              Topics
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="transition-colors duration-200">
      <div className="w-full">
        <div className="flex justify-between">
          <div className="flex space-x-6">
            <button 
              onClick={() => onTabChange('for-you')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'for-you' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              For You
            </button>
            <button 
              onClick={() => onTabChange('following')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'following' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Following
            </button>
            <button 
              onClick={() => onTabChange('popular')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'popular' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Popular
            </button>
            <button 
              onClick={() => onTabChange('latest')}
              className={`px-1 py-3 text-sm font-medium border-b-2 transition-colors duration-200 ${
                activeTab === 'latest' 
                  ? 'text-indigo-600 border-indigo-600' 
                  : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-200'
              }`}
            >
              Latest
            </button>
          </div>
          <button 
            onClick={onInterestsClick}
            className="group flex items-center gap-2 px-2 py-3 text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <span className="text-sm opacity-0 group-hover:opacity-100 transition-opacity">
              Customize Feed
            </span>
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}