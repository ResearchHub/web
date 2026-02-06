'use client';

import { useState, useMemo } from 'react';
import { useUser } from '@/contexts/UserContext';
import { Tabs } from '@/components/ui/Tabs';
import { useFeed } from '@/hooks/useFeed';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { FileText, Wallet } from 'lucide-react';
import { ImpactTab } from './ImpactTab';
import { GrantList } from './GrantList';
import { ProposalList } from './ProposalList';
import { PortfolioOverview } from '@/types/portfolioOverview';

export type PortfolioTab = 'my-rfps' | 'proposals' | 'impact';
type StatusFilter = 'all' | 'open' | 'closed';
type ProposalFilter = 'active' | 'previously-funded' | 'starred';

const MAIN_TABS = [
  { id: 'my-rfps', label: 'My RFPs' },
  { id: 'proposals', label: 'Proposals' },
  { id: 'impact', label: 'Impact' },
];

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'open', label: 'Open' },
  { id: 'closed', label: 'Closed' },
];

function toApiStatus(filter: StatusFilter): 'OPEN' | 'CLOSED' | undefined {
  if (filter === 'open') return 'OPEN';
  if (filter === 'closed') return 'CLOSED';
  return undefined;
}

function toProposalApiStatus(filter: ProposalFilter): 'OPEN' | 'CLOSED' | undefined {
  if (filter === 'active') return 'OPEN';
  if (filter === 'previously-funded') return 'CLOSED';
  return undefined;
}

interface PortfolioTabsProps {
  readonly activeTab: PortfolioTab;
  readonly onTabChange: (tab: PortfolioTab) => void;
  readonly overview: PortfolioOverview | null;
}

export function PortfolioTabs({ activeTab, onTabChange, overview }: PortfolioTabsProps) {
  return (
    <div className="space-y-4">
      <Tabs
        tabs={MAIN_TABS}
        activeTab={activeTab}
        onTabChange={(id) => onTabChange(id as PortfolioTab)}
        variant="pill"
      />

      {activeTab === 'my-rfps' && <RfpFeedTab />}
      {activeTab === 'proposals' && <ProposalsFeedTab overview={overview} />}
      {activeTab === 'impact' && <ImpactTab />}
    </div>
  );
}

function RfpFeedTab() {
  const { user } = useUser();
  const [filter, setFilter] = useState<StatusFilter>('all');

  const feedOptions = useMemo(
    () => ({
      endpoint: 'grant_feed' as const,
      createdBy: user?.id,
      fundraiseStatus: toApiStatus(filter),
    }),
    [user?.id, filter]
  );

  const feed = useFeed('all', feedOptions);

  return (
    <div className="space-y-4">
      <Tabs
        tabs={STATUS_TABS}
        activeTab={filter}
        onTabChange={(id) => setFilter(id as StatusFilter)}
        variant="pill-standalone"
      />
      <GrantList
        entries={feed.entries}
        isLoading={feed.isLoading}
        hasMore={feed.hasMore}
        loadMore={feed.loadMore}
        emptyState={
          <EmptyState
            icon={<FileText className="w-8 h-8 text-gray-400" />}
            title="No RFPs yet"
            description="Create your first Request for Proposal to start funding research on ResearchHub."
            action={{ label: 'Create an RFP', href: '/notebook?newGrant=true' }}
          />
        }
      />
    </div>
  );
}

interface ProposalsFeedTabProps {
  readonly overview: PortfolioOverview | null;
}

function ProposalsFeedTab({ overview }: ProposalsFeedTabProps) {
  const { user } = useUser();
  const [filter, setFilter] = useState<ProposalFilter>('active');

  // Get feed options based on current filter
  const feedOptions = useMemo(
    () => ({
      endpoint: 'funding_feed' as const,
      fundedBy: user?.id,
      fundraiseStatus:
        filter === 'active'
          ? ('OPEN' as const)
          : filter === 'previously-funded'
            ? ('CLOSED' as const)
            : undefined,
      bookmarked: filter === 'starred' ? true : undefined,
    }),
    [user?.id, filter]
  );

  const feed = useFeed('all', feedOptions);

  // Get counts from overview
  const activeCount = overview?.totalApplicants.active ?? 0;
  const previousCount = overview?.totalApplicants.previous ?? 0;
  const starredCount = 0; // Starred count would come from a different source

  const PROPOSAL_TABS = [
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'previously-funded', label: `Previously funded (${previousCount})` },
    { id: 'starred', label: `Starred (${starredCount})` },
  ];

  return (
    <div className="space-y-4">
      <Tabs
        tabs={PROPOSAL_TABS}
        activeTab={filter}
        onTabChange={(id) => setFilter(id as ProposalFilter)}
        variant="pill-standalone"
      />
      <ProposalList
        entries={feed.entries}
        isLoading={feed.isLoading}
        hasMore={feed.hasMore}
        loadMore={feed.loadMore}
        emptyState={
          <EmptyState
            icon={<Wallet className="w-8 h-8 text-gray-400" />}
            title={
              filter === 'active'
                ? 'No active proposals'
                : filter === 'previously-funded'
                  ? 'No previously funded proposals'
                  : 'No starred proposals'
            }
            description={
              filter === 'starred'
                ? 'Star proposals to save them here for later.'
                : 'Proposals you contribute to will appear here.'
            }
            action={{ label: 'Browse proposals', href: '/fund/needs-funding' }}
          />
        }
      />
    </div>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action: { label: string; href: string };
}

function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{description}</p>
      <Button asChild className="mt-6">
        <Link href={action.href}>{action.label}</Link>
      </Button>
    </div>
  );
}
