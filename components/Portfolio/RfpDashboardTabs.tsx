'use client';

import { useState } from 'react';
import { Users, FileText, Award } from 'lucide-react';
import { Tabs } from '@/components/ui/Tabs';
import { Button } from '@/components/ui/Button';
import { useFeed } from '@/hooks/useFeed';
import { FeedContent } from '@/components/Feed/FeedContent';
import { GrantOverview } from '@/types/grantOverview';

export type RfpTab = 'invite' | 'proposals' | 'updates';

interface Props {
  readonly grantId: number | null;
  readonly overview: GrantOverview | null;
}

export function RfpDashboardTabs({ grantId, overview }: Props) {
  const [activeTab, setActiveTab] = useState<RfpTab>('invite');

  const tabs = [
    {
      id: 'invite',
      label: 'Invite Researchers',
      icon: Users,
    },
    {
      id: 'proposals',
      label: `Review Proposals (${overview?.reviewProposals || 0})`,
      icon: FileText,
    },
    {
      id: 'updates',
      label: `Progress Updates (${overview?.progressUpdates || 0})`,
      icon: Award,
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-gray-200">
      <div className="px-5 pt-3">
        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={(id) => setActiveTab(id as RfpTab)} />
      </div>
      <div className="p-5">
        {activeTab === 'invite' && <InviteResearchersTab />}
        {activeTab === 'proposals' && grantId && <ReviewProposalsTab grantId={grantId} />}
        {activeTab === 'updates' && grantId && <ProgressUpdatesTab grantId={grantId} />}
      </div>
    </div>
  );
}

// --- Invite Researchers (placeholder) ---

function InviteResearchersTab() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <Users className="w-8 h-8 text-blue-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">Find Expert Researchers</h3>
      <p className="text-gray-500 max-w-sm">
        Use our AI-powered search to identify researchers with expertise relevant to your RFP.
        We&apos;ll find experts based on their publication history and research focus.
      </p>
      <Button className="mt-6">
        <Users className="w-4 h-4 mr-2" />
        Invite Researchers
      </Button>
    </div>
  );
}

// --- Review Proposals (open proposals) ---

function ReviewProposalsTab({ grantId }: { readonly grantId: number }) {
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'funding_feed',
    grantId,
  });

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      noEntriesElement={
        <EmptyState
          title="No open proposals"
          desc="Open proposals for this RFP will appear here."
        />
      }
      showFundraiseHeaders={false}
      showGrantHeaders={false}
    />
  );
}

// --- Progress Updates (closed proposals) ---

function ProgressUpdatesTab({ grantId }: { readonly grantId: number }) {
  const { entries, isLoading, hasMore, loadMore } = useFeed('all', {
    endpoint: 'funding_feed',
    grantId,
    hasRecentUpdates: true,
  });

  return (
    <FeedContent
      entries={entries}
      isLoading={isLoading}
      hasMore={hasMore}
      loadMore={loadMore}
      noEntriesElement={
        <EmptyState
          title="No progress updates"
          desc="Funded proposals and their progress will appear here."
        />
      }
      showFundraiseHeaders={false}
      showGrantHeaders={false}
    />
  );
}

// --- Shared Empty State ---

function EmptyState({ title, desc }: { readonly title: string; readonly desc: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <FileText className="w-8 h-8 text-gray-400" />
      </div>
      <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm">{desc}</p>
    </div>
  );
}
