'use client';

import { useActiveBountyAmount } from '@/components/Bounty/lib/useActiveBountyAmount';
import { PROPOSAL_TABS_ID, useSelectWorkTab } from '@/components/work/lib/workTabs';
import type { TabType } from '@/components/work/WorkHeader/WorkTabContext';
import { WorkPageTabs } from '@/components/work/WorkPageTabs';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

interface ProposalTabsProps {
  work: Work;
  metadata: WorkMetadata;
  updatesCount: number;
}

/** Proposal, Reviews, Updates, Conversation and Bounties, under the cover and stuck to the top as it scrolls. */
export function ProposalTabs({ work, metadata, updatesCount }: ProposalTabsProps) {
  const { activeTab, selectTab } = useSelectWorkTab(work);
  const { showUSD } = useCurrencyPreference();
  const bountyAmount = useActiveBountyAmount(metadata.bounties);

  return (
    <WorkPageTabs
      id={PROPOSAL_TABS_ID}
      activeTab={activeTab}
      onTabChange={(tab) => selectTab(tab as TabType)}
      tabs={[
        { id: 'paper', label: 'Proposal' },
        { id: 'reviews', label: 'Reviews', count: work.peerReviews?.length },
        { id: 'updates', label: 'Updates', count: updatesCount },
        { id: 'conversation', label: 'Conversation', count: metadata.metrics.conversationComments },
        {
          id: 'bounties',
          label: 'Bounties',
          count: bountyAmount ? (showUSD ? bountyAmount : `${bountyAmount} RSC`) : undefined,
        },
      ]}
    />
  );
}
