'use client';

import { Bell, FileText, MessageCircle, Star } from 'lucide-react';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import { StickyTabs } from '@/components/ui/StickyTabs';
import { useActiveBountyAmount } from '@/components/Bounty/lib/useActiveBountyAmount';
import { PROPOSAL_TABS_ID, useSelectWorkTab } from '@/components/work/lib/workTabs';
import type { TabType } from '@/components/work/WorkHeader/WorkTabContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

/** The bounty coin, in the tab's own colour. */
function bountyTabIcon(name: IconName) {
  return function BountyTabIcon({ className }: { className?: string }) {
    return <Icon name={name} size={16} color="currentColor" className={className} />;
  };
}

const BountiesIcon = bountyTabIcon('earn1');
const BountiesActiveIcon = bountyTabIcon('solidEarn');

interface ProposalTabsProps {
  work: Work;
  metadata: WorkMetadata;
  updatesCount: number;
  className?: string;
}

/** Proposal, Reviews, Updates, Conversation and Bounties, stuck to the top of the page as it scrolls. */
export function ProposalTabs({ work, metadata, updatesCount, className }: ProposalTabsProps) {
  const { activeTab, selectTab } = useSelectWorkTab(work);
  const { showUSD } = useCurrencyPreference();
  const bountyAmount = useActiveBountyAmount(metadata.bounties);

  return (
    <StickyTabs
      id={PROPOSAL_TABS_ID}
      className={className}
      activeTab={activeTab}
      onTabChange={(tab) => selectTab(tab as TabType)}
      tabs={[
        { id: 'paper', label: 'Proposal', icon: FileText },
        {
          id: 'reviews',
          label: 'Reviews',
          count: work.peerReviews?.length,
          icon: Star,
        },
        { id: 'updates', label: 'Updates', count: updatesCount, icon: Bell },
        {
          id: 'conversation',
          label: 'Conversation',
          count: metadata.metrics.conversationComments,
          icon: MessageCircle,
        },
        {
          id: 'bounties',
          label: 'Bounties',
          count: bountyAmount ? (showUSD ? bountyAmount : `${bountyAmount} RSC`) : undefined,
          icon: BountiesIcon,
          activeIcon: BountiesActiveIcon,
        },
      ]}
    />
  );
}
