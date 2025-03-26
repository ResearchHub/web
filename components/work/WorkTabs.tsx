'use client';

import { FileText, Star, Activity, MessagesSquare } from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { useState, useEffect } from 'react';
import Icon from '@/components/ui/icons/Icon';

export type TabType = 'paper' | 'reviews' | 'bounties' | 'comments';

interface WorkTabsProps {
  work: Work;
  metadata: WorkMetadata;
  defaultTab?: TabType;
  contentType?: 'paper' | 'post' | 'fund'; // To customize tab labels based on content type
  onTabChange: (tab: TabType) => void;
}

export const WorkTabs = ({
  work,
  metadata,
  defaultTab = 'paper',
  contentType = 'paper',
  onTabChange,
}: WorkTabsProps) => {
  // Initialize activeTab from URL or props
  const [activeTab, setActiveTab] = useState<TabType>(() => {
    // Check if URL contains a tab indicator
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/conversation')) return 'comments';
      if (path.includes('/reviews')) return 'reviews';
      if (path.includes('/bounties')) return 'bounties';
    }
    return defaultTab;
  });

  // Handle tab change
  const handleTabChange = (tab: TabType) => {
    // Only update if the tab is actually changing
    if (tab === activeTab) return;

    setActiveTab(tab);
    onTabChange(tab);

    // Update the URL without triggering a navigation
    if (typeof window !== 'undefined') {
      const baseUrl =
        contentType === 'paper'
          ? `/paper/${work.id}/${work.slug}`
          : contentType === 'fund'
            ? `/fund/${work.id}/${work.slug}`
            : `/post/${work.id}/${work.slug}`;

      const newUrl =
        tab === 'comments'
          ? `${baseUrl}/conversation`
          : tab === 'reviews'
            ? `${baseUrl}/reviews`
            : tab === 'bounties'
              ? `${baseUrl}/bounties`
              : baseUrl;

      // Use history.replaceState to update URL without navigation
      window.history.replaceState(null, '', newUrl);
    }
  };

  // Get the appropriate label for the main content tab
  const getMainTabLabel = () => {
    if (contentType === 'paper') return 'Paper';
    if (contentType === 'fund') return 'Project';
    return 'Post';
  };

  return (
    <div className="border-b mb-6">
      <nav className="flex space-x-8 mt-6">
        <button
          className={`px-1 py-4 text-md font-medium border-b-2 ${
            activeTab === 'paper'
              ? 'text-indigo-600 border-indigo-600'
              : 'text-gray-500 border-transparent hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('paper')}
        >
          <div className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            {getMainTabLabel()}
          </div>
        </button>
        <button
          className={`px-1 py-4 text-md font-medium ${
            activeTab === 'comments'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('comments')}
        >
          <div className="flex items-center">
            <MessagesSquare className="h-4 w-4 mr-2" />
            Activity
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'comments'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {metadata.metrics.comments}
            </span>
          </div>
        </button>
        <button
          className={`px-1 py-4 text-md font-medium ${
            activeTab === 'bounties'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('bounties')}
        >
          <div className="flex items-center">
            <Icon name="earn1" size={16} color={activeTab === 'bounties' ? '#4f46e5' : '#6B7280'} />
            <span className="ml-2">Bounties</span>
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'bounties'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {metadata.openBounties || 0}
            </span>
          </div>
        </button>
        <button
          className={`px-1 py-4 text-md font-medium ${
            activeTab === 'reviews'
              ? 'text-indigo-600 border-b-2 border-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
          onClick={() => handleTabChange('reviews')}
        >
          <div className="flex items-center">
            <Star className="h-4 w-4 mr-2" />
            Reviews
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === 'reviews'
                  ? 'bg-indigo-100 text-indigo-600'
                  : 'bg-gray-100 text-gray-600'
              }`}
            >
              {metadata.metrics.reviews}
            </span>
          </div>
        </button>
      </nav>
    </div>
  );
};
