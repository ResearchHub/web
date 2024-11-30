'use client'

import { Settings } from "lucide-react";

interface FeedTabsProps {
  showingInterests: boolean;
  onInterestsClick: () => void;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({ showingInterests, onInterestsClick }) => (
  <div className="border-b mb-6 w-full">
    <div className="flex justify-between">
      <div className="flex space-x-8">
        <button 
          className={`px-1 py-4 text-sm font-medium ${
            !showingInterests && 'text-indigo-600 border-b-2 border-indigo-600'
          } ${showingInterests && 'text-gray-500 hover:text-gray-700'}`}
        >
          For You
        </button>
        <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
          Following
        </button>
        <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
          Popular
        </button>
        <button className="px-1 py-4 text-sm font-medium text-gray-500 hover:text-gray-700">
          Latest
        </button>
      </div>
      <button 
        onClick={onInterestsClick}
        className={`px-1 py-4 text-sm font-medium ${
          showingInterests ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'
        }`}
      >
        <Settings className="w-4 h-4" />
      </button>
    </div>
  </div>
);