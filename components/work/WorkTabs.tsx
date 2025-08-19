'use client';

import {
  FileText,
  Star,
  MessagesSquare,
  History,
  Users,
  Bell,
  MessageCircleQuestion,
} from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { useState, useEffect, useMemo } from 'react';
import Icon from '@/components/ui/icons/Icon';
import { Tabs } from '@/components/ui/Tabs';
import { usePathname } from 'next/navigation';

export type TabType =
  | 'paper'
  | 'updates'
  | 'reviews'
  | 'bounties'
  | 'conversation'
  | 'history'
  | 'applications';

interface WorkTabsProps {
  work: Work;
  metadata: WorkMetadata;
  defaultTab?: TabType;
  contentType?: 'paper' | 'post' | 'fund' | 'grant'; // To customize tab labels based on content type
  onTabChange: (tab: TabType) => void;
  updatesCount?: number;
}

export const WorkTabs = ({
  work,
  metadata,
  defaultTab = 'paper',
  contentType = 'paper',
  onTabChange,
  updatesCount = 0,
}: WorkTabsProps) => {
  const pathname = usePathname();

  // Check if any version is part of the ResearchHub journal
  const hasResearchHubJournalVersions = useMemo(() => {
    return (work.versions || []).some((version) => version.isResearchHubJournal);
  }, [work.versions]);

  // Get the active tab based on current path
  const getActiveTabFromPath = (path: string): TabType => {
    if (path.includes('/updates')) return 'updates';
    if (path.includes('/conversation')) return 'conversation';
    if (path.includes('/applications')) return 'applications';
    if (path.includes('/reviews')) return 'reviews';
    if (path.includes('/bounties')) return 'bounties';
    if (path.includes('/history') && hasResearchHubJournalVersions) return 'history';
    return 'paper';
  };

  // Initialize activeTab from URL or props
  const [activeTab, setActiveTab] = useState<TabType>(() => defaultTab);

  // Update active tab when pathname changes
  useEffect(() => {
    const tabFromPath = getActiveTabFromPath(pathname);
    if (tabFromPath !== activeTab) {
      setActiveTab(tabFromPath);
      onTabChange(tabFromPath);
    }
  }, [pathname, onTabChange, hasResearchHubJournalVersions]);

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
            : contentType === 'grant'
              ? `/grant/${work.id}/${work.slug}`
              : work.postType === 'QUESTION'
                ? `/question/${work.id}/${work.slug}`
                : `/post/${work.id}/${work.slug}`;

      const newUrl =
        tab === 'updates'
          ? `${baseUrl}/updates`
          : tab === 'conversation'
            ? `${baseUrl}/conversation`
            : tab === 'reviews'
              ? `${baseUrl}/reviews`
              : tab === 'applications'
                ? `${baseUrl}/applications`
                : tab === 'bounties'
                  ? `${baseUrl}/bounties`
                  : tab === 'history'
                    ? `${baseUrl}/history`
                    : baseUrl;

      // Use history.replaceState to update URL without navigation
      window.history.replaceState(null, '', newUrl);
    }
  };

  // Get the appropriate label for the main content tab
  const getMainTabLabel = () => {
    if (contentType === 'paper') return 'Paper';
    if (contentType === 'fund') return 'Project';
    if (contentType === 'grant') return 'Grant';
    if (work.postType === 'QUESTION') return 'Question';
    return 'Post';
  };

  // Define base tabs
  const baseTabs = [
    {
      id: 'paper',
      label: (
        <div className="flex items-center">
          {work.postType === 'QUESTION' ? (
            <MessageCircleQuestion className="h-4 w-4 mr-2" />
          ) : (
            <FileText className="h-4 w-4 mr-2" />
          )}
          {getMainTabLabel()}
        </div>
      ),
    },
    // Show Updates tab only for fund content type
    ...(contentType === 'fund'
      ? [
          {
            id: 'updates',
            label: (
              <div className="flex items-center">
                <Bell className="h-4 w-4 mr-2" />
                <span>Updates</span>
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === 'updates'
                      ? 'bg-indigo-100 text-indigo-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {updatesCount}
                </span>
              </div>
            ),
          },
        ]
      : []),
    {
      id: 'conversation',
      label: (
        <div className="flex items-center">
          <MessagesSquare className="h-4 w-4 mr-2" />
          <span>{work.postType === 'QUESTION' ? 'Answers' : 'Conversation'}</span>
          <span
            className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
              activeTab === 'conversation'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {metadata.metrics.conversationComments || 0}
          </span>
        </div>
      ),
    },
    // Show Reviews/Applications tab only if not a question
    ...(work.postType === 'QUESTION'
      ? []
      : [
          {
            id: contentType === 'grant' ? 'applications' : 'reviews',
            label: (
              <div className="flex items-center">
                {contentType === 'grant' ? (
                  <Users className="h-4 w-4 mr-2" />
                ) : (
                  <Star className="h-4 w-4 mr-2" />
                )}
                <span>{contentType === 'grant' ? 'Applications' : 'Reviews'}</span>
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    (
                      contentType === 'grant'
                        ? activeTab === 'applications'
                        : activeTab === 'reviews'
                    )
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {contentType === 'grant'
                    ? work.note?.post?.grant?.applicants?.length || 0
                    : metadata.metrics.reviews}
                </span>
              </div>
            ),
          },
        ]),
    // Show Bounties tab only if not grant
    ...(contentType === 'grant'
      ? []
      : [
          {
            id: 'bounties',
            label: (
              <div className="flex items-center">
                <Icon
                  name="earn1"
                  size={16}
                  color={activeTab === 'bounties' ? '#3971ff' : '#6B7280'}
                />
                <span className="ml-2">Bounties</span>
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === 'bounties'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {metadata.metrics.bountyComments || 0}
                </span>
              </div>
            ),
          },
        ]),
  ];

  // Add history tab only if any version is part of ResearchHub Journal
  const tabs = useMemo(() => {
    if (hasResearchHubJournalVersions) {
      return [
        ...baseTabs,
        {
          id: 'history',
          label: (
            <div className="flex items-center">
              <History className="h-4 w-4 mr-2" />
              <span>History</span>
              <span
                className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === 'history'
                    ? 'bg-primary-100 text-primary-600'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {work.versions?.length || 0}
              </span>
            </div>
          ),
        },
      ];
    }
    return baseTabs;
  }, [baseTabs, hasResearchHubJournalVersions, activeTab, work.versions?.length]);

  return (
    <div className="border-b mb-6">
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={(id) => handleTabChange(id as TabType)}
        className="mt-6"
      />
    </div>
  );
};
