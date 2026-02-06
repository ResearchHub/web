'use client';

import { useState } from 'react';
import Link from 'next/link';
import { FileText, Wallet } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { useFeed } from '@/hooks/useFeed';
import { useFilterTransition } from './lib/hooks/useFilterTransition';
import { ImpactTab } from './ImpactTab';
import { GrantList } from './GrantList';
import { ProposalList } from './ProposalList';
import { PortfolioOverview } from '@/types/portfolioOverview';

export type PortfolioTab = 'my-rfps' | 'proposals' | 'impact';
type GrantsFilter = 'all' | 'open' | 'closed';
type ProposalFilter = 'active' | 'previously-funded' | 'starred';

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

interface Props {
  readonly activeTab: PortfolioTab;
  readonly onTabChange: (tab: PortfolioTab) => void;
  readonly overview: PortfolioOverview | null;
}

export function PortfolioTabs({ activeTab, onTabChange, overview }: Props) {
  return (
    <div className="space-y-4">
      <Tabs
        tabs={MAIN_TABS}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as PortfolioTab)}
        variant="pill"
      />
      {activeTab === 'my-rfps' && <GrantsTab />}
      {activeTab === 'proposals' && <ProposalsTab overview={overview} />}
      {activeTab === 'impact' && <ImpactTab />}
    </div>
  );
}

function GrantsTab() {
  const { user } = useUser();
  const [filter, setFilter] = useState<GrantsFilter>('all');
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'grant_feed',
    createdBy: user?.id,
    fundraiseStatus: STATUS_MAP[filter],
  });
  const { isTransitioning, startTransition } = useFilterTransition(isLoading);

  const handleFilterChange = (id: string) => {
    if (id !== filter) {
      startTransition();
      setFilter(id as GrantsFilter);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        tabs={GRANTS_FILTERS}
        activeTab={filter}
        onTabChange={handleFilterChange}
        variant="pill-standalone"
      />
      <GrantList
        entries={isTransitioning ? [] : entries}
        isLoading={isLoading || isTransitioning}
        hasMore={hasMore}
        loadMore={loadMore}
        emptyState={
          <Empty
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            title="No RFPs yet"
            desc="Create your first Request for Proposal to start funding research."
            action="Create an RFP"
            href="/notebook?newGrant=true"
          />
        }
      />
    </div>
  );
}

const EMPTY_MESSAGES: Record<ProposalFilter, [string, string]> = {
  active: ['No active proposals', 'Proposals you contribute to will appear here.'],
  'previously-funded': [
    'No previously funded proposals',
    'Proposals you contribute to will appear here.',
  ],
  starred: ['No starred proposals', 'Star proposals to save them here for later.'],
};

function ProposalsTab({ overview }: { readonly overview: PortfolioOverview | null }) {
  const { user } = useUser();
  const [filter, setFilter] = useState<ProposalFilter>('active');
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'funding_feed',
    fundedBy: user?.id,
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
    { id: 'starred', label: 'Starred' },
  ];

  const [emptyTitle, emptyDesc] = EMPTY_MESSAGES[filter];

  return (
    <div className="space-y-4">
      <Tabs
        tabs={tabs}
        activeTab={filter}
        onTabChange={handleFilterChange}
        variant="pill-standalone"
      />
      <ProposalList
        entries={isTransitioning ? [] : entries}
        isLoading={isLoading || isTransitioning}
        hasMore={hasMore}
        loadMore={loadMore}
        emptyState={
          <Empty
            icon={<Wallet className="w-8 h-8 text-gray-400" />}
            title={emptyTitle}
            desc={emptyDesc}
            action="Browse proposals"
            href="/fund/needs-funding"
          />
        }
      />
    </div>
  );
}

function Empty({
  icon,
  title,
  desc,
  action,
  href,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  action: string;
  href: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{desc}</p>
      <Button asChild className="mt-6">
        <Link href={href}>{action}</Link>
      </Button>
    </div>
  );
}
