'use client';

import { useCallback } from 'react';
import {
  Bell,
  FileText,
  type LucideIcon,
  type LucideProps,
  MessageCircle,
  Star,
} from 'lucide-react';
import Icon, { type IconName } from '@/components/ui/icons/Icon';
import { StickyTabs } from '@/components/ui/StickyTabs';
import { useActiveBountyAmount } from '@/components/Bounty/lib/useActiveBountyAmount';
import { useWorkTab } from '@/components/work/WorkHeader/WorkTabContext';
import { useWorkTabChange } from '@/components/work/useWorkTabChange';
import type { TabType } from '@/components/work/WorkTabs';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

const PROPOSAL_TABS_ID = 'proposal-tabs';

/** The bounty coin, in the tab's own colour. */
function bountyTabIcon(name: IconName): LucideIcon {
  return function BountyTabIcon({ className }: LucideProps) {
    return <Icon name={name} size={16} color="currentColor" className={className} />;
  } as LucideIcon;
}

const BountiesIcon = bountyTabIcon('earn1');
const BountiesActiveIcon = bountyTabIcon('solidEarn');

/** Opens one of a proposal's tabs from elsewhere on its page, and scrolls the tabs into view. */
export function useShowProposalTab(work: Work) {
  const { setActiveTab } = useWorkTab();
  const handleWorkTabChange = useWorkTabChange(work, 'fund');

  return useCallback(
    (tab: TabType) => {
      setActiveTab(tab);
      handleWorkTabChange(tab);
      document
        .getElementById(PROPOSAL_TABS_ID)
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    },
    [setActiveTab, handleWorkTabChange]
  );
}

interface ProposalTabsProps {
  work: Work;
  metadata: WorkMetadata;
  updatesCount: number;
  className?: string;
}

/** Proposal, Reviews, Updates, Conversation and Bounties, stuck to the top of the page as it scrolls. */
export function ProposalTabs({ work, metadata, updatesCount, className }: ProposalTabsProps) {
  const { activeTab, setActiveTab } = useWorkTab();
  const handleWorkTabChange = useWorkTabChange(work, 'fund');
  const { showUSD } = useCurrencyPreference();
  const bountyAmount = useActiveBountyAmount(metadata.bounties);

  const handleTabChange = (id: string) => {
    const tab = id as TabType;
    if (tab === activeTab) return;
    setActiveTab(tab);
    handleWorkTabChange(tab);
  };

  // Tabs with nothing in them yet go without a count.
  const countOf = (count?: number) => (count ? count : undefined);

  return (
    <StickyTabs
      id={PROPOSAL_TABS_ID}
      className={className}
      activeTab={activeTab}
      onTabChange={handleTabChange}
      tabs={[
        { id: 'paper', label: 'Proposal', icon: FileText },
        {
          id: 'reviews',
          label: 'Reviews',
          count: countOf(work.peerReviews?.length),
          icon: Star,
        },
        { id: 'updates', label: 'Updates', count: countOf(updatesCount), icon: Bell },
        {
          id: 'conversation',
          label: 'Conversation',
          count: countOf(metadata.metrics.conversationComments),
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
