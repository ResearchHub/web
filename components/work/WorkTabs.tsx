'use client';

import { FileText, Star, MessageCircle, MessageCircleQuestion } from 'lucide-react';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { Tabs } from '@/components/ui/Tabs';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import Icon from '@/components/ui/icons/Icon';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useActiveBountyAmount } from '@/components/Bounty/lib/useActiveBountyAmount';
import { useSelectWorkTab } from '@/components/work/lib/workTabs';
import type { TabType } from '@/components/work/WorkHeader/WorkTabContext';
import { colors } from '@/app/styles/colors';

interface WorkTabsProps {
  work: Work;
  metadata: WorkMetadata;
}

/** A post's or a question's tabs, under its title. Proposals have their own, in the page. */
export const WorkTabs = ({ work, metadata }: WorkTabsProps) => {
  const { activeTab, selectTab } = useSelectWorkTab(work);
  const { showUSD } = useCurrencyPreference();
  const bountyAmount = useActiveBountyAmount(metadata.bounties || []);

  const reviewCount = work.peerReviews?.length ?? 0;

  // Get the appropriate label for the main content tab
  const getMainTabLabel = () => (work.postType === 'QUESTION' ? 'Question' : 'Post');

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
                  {reviewCount}
                </span>
              </div>
            ),
          },
        ]),
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
            {bountyAmount ? (
              <>
                {!showUSD && (
                  <ResearchCoinIcon
                    size={12}
                    color={activeTab === 'bounties' ? colors.primary[500] : colors.gray[500]}
                    outlined
                  />
                )}
                {bountyAmount}
              </>
            ) : (
              0
            )}
          </span>
        </div>
      ),
    },
  ];

  const tabs = baseTabs;

  return (
    <Tabs
      tabs={tabs}
      activeTab={activeTab}
      onTabChange={(id) => selectTab(id as TabType)}
      className="border-b-0"
    />
  );
};
