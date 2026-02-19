'use client';

import {
  FileText,
  LayoutList,
  Star,
  MessageCircle,
  History,
  Activity,
  Bell,
  MessageCircleQuestion,
} from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { useState, useEffect, useMemo } from 'react';
import { Tabs } from '@/components/ui/Tabs';
import { usePathname } from 'next/navigation';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { buildPayloadForDocumentTabClick } from '@/types/analytics';
import { useUser } from '@/contexts/UserContext';
import { useDeviceType } from '@/hooks/useDeviceType';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import Icon from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { getOpenBounties, getTotalBountyDisplayAmount } from '@/components/Bounty/lib/bountyUtil';
import { formatCurrency } from '@/utils/currency';
import { colors } from '@/app/styles/colors';

export type TabType =
  | 'paper'
  | 'proposals'
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
  const { user } = useUser();
  const deviceType = useDeviceType();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate, isLoading: isExchangeRateLoading } = useExchangeRate();

  // Format score to show with one decimal place (same as FeedItemActions)
  const formatScore = (score: number): string => {
    return score.toFixed(1);
  };

  // Calculate total bounty amount for open bounties (handles Foundation bounties with flat $150 USD)
  const openBounties = useMemo(() => getOpenBounties(metadata.bounties || []), [metadata.bounties]);
  const { amount: totalBountyAmount } = useMemo(
    () => getTotalBountyDisplayAmount(openBounties, exchangeRate, showUSD),
    [openBounties, exchangeRate, showUSD]
  );

  // Check if we can display the bounty amount (exchange rate loaded if USD preferred)
  const canDisplayBountyAmount =
    !showUSD || (showUSD && !isExchangeRateLoading && exchangeRate > 0);

  // Check if we have open bounties
  const hasOpenBounties = openBounties.length > 0;

  // Check if any version is part of the ResearchHub journal
  const hasResearchHubJournalVersions = useMemo(() => {
    return (work.versions || []).some((version) => version.isResearchHubJournal);
  }, [work.versions]);

  // Get the active tab based on current path
  const getActiveTabFromPath = (path: string): TabType => {
    if (path.includes('/updates')) return 'updates';
    if (path.includes('/conversation')) return 'conversation';
    if (path.includes('/details') && contentType === 'grant') return 'paper';
    if (path.includes('/applications') && contentType === 'grant') return 'proposals';
    if (path.includes('/applications')) return 'applications';
    if (path.includes('/reviews')) return 'reviews';
    if (path.includes('/bounties')) return 'bounties';
    if (path.includes('/history') && hasResearchHubJournalVersions) return 'history';
    if (contentType === 'grant') return 'proposals';
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

    // Track tab click analytics
    try {
      const payload = buildPayloadForDocumentTabClick(work, {
        clickedTab: tab,
        deviceType,
      });
      AnalyticsService.logEventWithUserProperties(LogEvent.DOCUMENT_TAB_CLICKED, payload, user);
    } catch (error) {
      console.warn('Failed to track document tab click analytics:', error);
    }

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

      const tabUrlMap: Partial<Record<TabType, string>> = {
        updates: `${baseUrl}/updates`,
        conversation: `${baseUrl}/conversation`,
        reviews: `${baseUrl}/reviews`,
        applications: `${baseUrl}/applications`,
        bounties: `${baseUrl}/bounties`,
        history: `${baseUrl}/history`,
        ...(contentType === 'grant' ? { paper: `${baseUrl}/details` } : {}),
      };
      const newUrl = tabUrlMap[tab] || baseUrl;

      // Use history.replaceState to update URL without navigation
      window.history.replaceState(null, '', newUrl);
    }
  };

  // Get the appropriate label for the main content tab
  const getMainTabLabel = () => {
    if (contentType === 'paper') return 'Paper';
    if (contentType === 'fund') return 'Project';
    if (contentType === 'grant') return 'Details';
    if (work.postType === 'QUESTION') return 'Question';
    return 'Post';
  };

  // Build grant-specific tabs: Proposals, Details, Conversation, Activity
  const grantTabs = [
    {
      id: 'proposals',
      label: (
        <div className="flex items-center">
          <LayoutList className="h-4 w-4 mr-2" />
          <span>Proposals</span>
        </div>
      ),
    },
    {
      id: 'paper',
      label: (
        <div className="flex items-center">
          <FileText className="h-4 w-4 mr-2" />
          <span>Details</span>
        </div>
      ),
    },
    {
      id: 'conversation',
      label: (
        <div className="flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          <span>Conversation</span>
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
    {
      id: 'history',
      label: (
        <div className="flex items-center">
          <Activity className="h-4 w-4 mr-2" />
          <span>Activity</span>
        </div>
      ),
    },
  ];

  // Define base tabs (non-grant content types)
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
          <MessageCircle className="h-4 w-4 mr-2" />
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
    // Show Reviews tab only if not a question
    ...(work.postType === 'QUESTION'
      ? []
      : [
          {
            id: 'reviews',
            label: (
              <div className="flex items-center">
                <Star
                  className={`h-4 w-4 mr-2 ${
                    activeTab === 'reviews' ? 'text-primary-500' : 'text-gray-500'
                  }`}
                />
                <span>Reviews</span>
                <span
                  className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                    activeTab === 'reviews'
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {metadata.metrics.reviewScore ? formatScore(metadata.metrics.reviewScore) : 0}
                </span>
              </div>
            ),
          },
        ]),
    {
      id: 'bounties',
      label: (
        <div className="flex items-center">
          <Icon
            name={activeTab === 'bounties' ? 'solidEarn' : 'earn1'}
            size={16}
            color={activeTab === 'bounties' ? colors.primary[500] : colors.gray[500]}
          />
          <span className="ml-2">Bounties</span>
          <span
            className={`ml-2 py-0.5 px-2 rounded-full text-xs flex items-center gap-0.5 ${
              activeTab === 'bounties'
                ? 'bg-primary-100 text-primary-600'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {hasOpenBounties && canDisplayBountyAmount ? (
              <>
                {!showUSD && (
                  <ResearchCoinIcon
                    size={12}
                    color={activeTab === 'bounties' ? colors.primary[500] : colors.gray[500]}
                    outlined
                  />
                )}
                {formatCurrency({
                  amount: totalBountyAmount,
                  showUSD,
                  exchangeRate,
                  shorten: true,
                  skipConversion: showUSD,
                })}
              </>
            ) : (
              0
            )}
          </span>
        </div>
      ),
    },
  ];

  const tabs = useMemo(() => {
    if (contentType === 'grant') {
      return grantTabs;
    }

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
  }, [
    baseTabs,
    grantTabs,
    contentType,
    hasResearchHubJournalVersions,
    activeTab,
    work.versions?.length,
  ]);

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
