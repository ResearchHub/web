'use client';

import { useCallback, useState } from 'react';
import Link from 'next/link';
import { FileText, Wallet, LucideIcon } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { useFilterTransition } from './lib/hooks/useFilterTransition';
import { ImpactTab } from './ImpactTab';
import { PortfolioOverview } from '@/types/portfolioOverview';
import { FeedEntry, FeedGrantContent } from '@/types/feed';

export type PortfolioTab = 'my-rfps' | 'proposals' | 'impact';
type GrantsFilter = 'all' | 'open' | 'closed';
type ProposalFilter = 'active' | 'previously-funded';

const MAIN_TABS = [
  { id: 'my-rfps', label: 'My RFPs' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'impact', label: 'Impact' },
];

const GRANTS_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
];

const STATUS_MAP: Record<string, 'OPEN' | 'CLOSED' | undefined> = {
  open: 'OPEN',
  active: 'OPEN',
  closed: 'CLOSED',
  'previously-funded': 'CLOSED',
};

interface EmptyStateConfig {
  readonly icon: LucideIcon;
  readonly title: string;
  readonly desc: string;
  readonly action: string;
  readonly href: string;
}

const EMPTY_STATES: Record<'grants' | ProposalFilter, EmptyStateConfig> = {
  grants: {
    icon: FileText,
    title: 'No RFPs yet',
    desc: 'Create your first Request for Proposal to start funding research.',
    action: 'Create an RFP',
    href: '/notebook?newGrant=true',
  },
  active: {
    icon: Wallet,
    title: 'No active proposals',
    desc: 'Proposals you contribute to will appear here.',
    action: 'Browse proposals',
    href: '/fund/needs-funding',
  },
  'previously-funded': {
    icon: Wallet,
    title: 'No previously funded proposals',
    desc: 'Proposals you contribute to will appear here.',
    action: 'Browse proposals',
    href: '/fund/needs-funding',
  },
};

interface Props {
  readonly activeTab: PortfolioTab;
  readonly onTabChange: (tab: PortfolioTab) => void;
  readonly overview: PortfolioOverview | null;
  /** Temporary: override the user whose data is shown (via ?user_id=X) */
  readonly userId?: number;
}

export function PortfolioTabs({ activeTab, onTabChange, overview, userId }: Props) {
  return (
    <div className="space-y-4">
      <Tabs
        tabs={MAIN_TABS}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as PortfolioTab)}
        variant="pill"
      />
      {activeTab === 'my-rfps' && <GrantsTab userId={userId} />}
      {activeTab === 'proposals' && <ProposalsTab overview={overview} userId={userId} />}
      {activeTab === 'impact' && <ImpactTab userId={userId} />}
    </div>
  );
}

function GrantsTab({ userId }: { readonly userId?: number }) {
  const [filter, setFilter] = useState<GrantsFilter>('all');
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'grant_feed',
    createdBy: userId,
    fundraiseStatus: STATUS_MAP[filter],
  });
  const { isTransitioning, startTransition } = useFilterTransition(isLoading);

  const handleFilterChange = (id: string) => {
    if (id !== filter) {
      startTransition();
      setFilter(id as GrantsFilter);
    }
  };

  const getEntryHref = useCallback((entry: FeedEntry) => {
    if (entry.contentType === 'GRANT') {
      return `/fund/dashboard/${(entry.content as FeedGrantContent).id}`;
    }
    return undefined;
  }, []);

  return (
    <div className="space-y-4">
      <Tabs
        tabs={GRANTS_FILTERS}
        activeTab={filter}
        onTabChange={handleFilterChange}
        variant="pill-standalone"
      />
      <FeedContent
        entries={isTransitioning ? [] : entries}
        isLoading={isLoading || isTransitioning}
        hasMore={hasMore}
        loadMore={loadMore}
        noEntriesElement={<EmptyState {...EMPTY_STATES.grants} />}
        showFundraiseHeaders={false}
        showGrantHeaders={false}
        getEntryHref={getEntryHref}
      />
    </div>
  );
}

interface ProposalsTabProps {
  readonly overview: PortfolioOverview | null;
  readonly userId?: number;
}

function ProposalsTab({ overview, userId }: ProposalsTabProps) {
  const [filter, setFilter] = useState<ProposalFilter>('active');
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'funding_feed',
    fundedBy: userId,
    fundraiseStatus: STATUS_MAP[filter],
  });
  const { isTransitioning, startTransition } = useFilterTransition(isLoading);

  const handleFilterChange = (id: string) => {
    if (id !== filter) {
      startTransition();
      setFilter(id as ProposalFilter);
    }
  };

  const tabs = [
    { id: 'active', label: `Active (${overview?.totalApplicants.active ?? 0})` },
    {
      id: 'previously-funded',
      label: `Previously funded (${overview?.totalApplicants.previous ?? 0})`,
    },
  ];

  return (
    <div className="space-y-4">
      <Tabs
        tabs={tabs}
        activeTab={filter}
        onTabChange={handleFilterChange}
        variant="pill-standalone"
      />
      <FeedContent
        entries={isTransitioning ? [] : entries}
        isLoading={isLoading || isTransitioning}
        hasMore={hasMore}
        loadMore={loadMore}
        noEntriesElement={<EmptyState {...EMPTY_STATES[filter]} />}
        showFundraiseHeaders={false}
        showGrantHeaders={false}
      />
    </div>
  );
}

function EmptyState({ icon: Icon, title, desc, action, href }: EmptyStateConfig) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{desc}</p>
      <Button asChild className="mt-6">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}
