'use client';

import { useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FeedItemSkeleton } from '@/components/Feed/FeedItemSkeleton';
import { FeedItemPost } from '@/components/Feed/items/FeedItemPost';
import { Tabs } from '@/components/ui/Tabs';
import {
  type DraftOperation,
  useRegisteredReportModeration,
} from '@/hooks/useRegisteredReportModeration';
import type { FeedEntry, FeedPostContent } from '@/types/feed';
import { buildWorkUrl } from '@/utils/url';

type JournalTab = 'eligible-proposals' | 'registered-reports';

const journalTabs = [
  { id: 'eligible-proposals', label: 'Eligible Proposals' },
  { id: 'registered-reports', label: 'Registered Reports' },
];

function getProposal(entry: FeedEntry): FeedPostContent | null {
  const proposal = entry.content;
  return proposal.contentType === 'PREREGISTRATION' ? proposal : null;
}

function LoadingCandidates() {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {[1, 2, 3].map((index) => (
        <FeedItemSkeleton key={index} hideActions showHeader={false} />
      ))}
    </div>
  );
}

function EmptyCandidates() {
  return (
    <div className="py-12 text-center">
      <div className="flex flex-col items-center justify-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h2 className="mb-2 text-lg font-medium text-gray-900">All caught up!</h2>
        <p className="max-w-md text-center text-gray-600">
          No completed, funded proposals are ready to become Registered Reports.
        </p>
      </div>
    </div>
  );
}

function AccessError({ message }: Readonly<{ message: string }>) {
  return (
    <div className="flex min-h-72 items-center justify-center">
      <div className="max-w-md text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h2 className="text-lg font-semibold text-gray-900">Moderator access required</h2>
        <p className="mt-2 text-sm text-gray-600">{message}</p>
      </div>
    </div>
  );
}

interface CandidateListProps {
  entries: FeedEntry[];
  draftOperation: DraftOperation | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onOpenOrCreateDraft: (proposalId: number) => Promise<void>;
  onLoadMore: () => Promise<void>;
}

function CandidateList({
  entries,
  draftOperation,
  hasMore,
  isLoadingMore,
  onOpenOrCreateDraft,
  onLoadMore,
}: Readonly<CandidateListProps>) {
  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {entries.map((entry) => {
        const proposal = getProposal(entry);
        if (!proposal) return null;

        const proposalId = proposal.id;
        const isCurrentDraft = draftOperation?.proposalId === proposalId;
        const noteId = isCurrentDraft ? draftOperation.noteId : undefined;
        const isProcessing = Boolean(isCurrentDraft && draftOperation.isProcessing);

        return (
          <FeedItemPost
            key={entry.id}
            entry={entry}
            href={buildWorkUrl({
              id: proposalId,
              slug: proposal.slug,
              contentType: 'preregistration',
            })}
            showActions={false}
            showHeader={false}
            footer={
              <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50 px-3 py-1.5">
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => onOpenOrCreateDraft(proposalId)}
                  onKeyDown={(event) => event.stopPropagation()}
                  disabled={draftOperation?.isProcessing === true}
                  className="gap-1"
                >
                  {isProcessing && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  {noteId ? 'Open Registered Report' : 'Create Registered Report'}
                  <ArrowRight size={14} />
                </Button>
              </div>
            }
          />
        );
      })}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button
            variant="outlined"
            onClick={onLoadMore}
            disabled={isLoadingMore || draftOperation?.isProcessing === true}
          >
            {isLoadingMore ? 'Loading...' : 'Load more'}
          </Button>
        </div>
      )}
    </div>
  );
}

interface CandidatesContentProps extends CandidateListProps {
  isLoading: boolean;
  loadError: string | null;
  onRetry: () => Promise<void>;
}

function CandidatesContent({
  isLoading,
  loadError,
  onRetry,
  ...candidateListProps
}: Readonly<CandidatesContentProps>) {
  if (isLoading) {
    return <LoadingCandidates />;
  }

  if (loadError) {
    return (
      <div className="py-12 text-center">
        <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
        <h2 className="text-lg font-semibold text-gray-900">Unable to load eligible proposals</h2>
        <p className="mt-2 text-sm text-gray-600">{loadError}</p>
        <Button className="mt-5" onClick={onRetry}>
          Try again
        </Button>
      </div>
    );
  }

  if (candidateListProps.entries.length === 0 && !candidateListProps.hasMore) {
    return <EmptyCandidates />;
  }

  return <CandidateList {...candidateListProps} />;
}

interface JournalTabContentProps extends CandidatesContentProps {
  activeTab: JournalTab;
}

function JournalTabContent({
  activeTab,
  ...candidateContentProps
}: Readonly<JournalTabContentProps>) {
  if (activeTab === 'registered-reports') {
    return (
      <div className="py-12 text-center">
        <h2 className="text-lg font-medium text-gray-900">Registered Reports</h2>
        <p className="mt-2 text-gray-600">Published Registered Reports will appear here soon.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 pt-6">
      <CandidatesContent {...candidateContentProps} />
    </div>
  );
}

export function JournalContent() {
  const [activeTab, setActiveTab] = useState<JournalTab>('eligible-proposals');
  const {
    entries,
    draftOperation,
    hasMore,
    isLoading,
    isLoadingMore,
    loadError,
    accessError,
    refreshCandidates,
    loadMoreCandidates,
    openOrCreateDraft,
  } = useRegisteredReportModeration();

  const changeTab = (tabId: string) => {
    if (draftOperation?.isProcessing) return;

    if (tabId === 'eligible-proposals' || tabId === 'registered-reports') {
      setActiveTab(tabId);
    }
  };

  if (accessError) {
    return <AccessError message={accessError} />;
  }

  return (
    <div className="flex h-full flex-col p-4">
      <div className="bg-white">
        <div className="mb-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Journal</h1>
            <p className="mt-1 text-sm text-gray-600">
              Create and manage moderator-owned Registered Reports.
            </p>
          </div>

          {activeTab === 'eligible-proposals' && (
            <Button
              variant="outlined"
              size="sm"
              onClick={refreshCandidates}
              disabled={isLoading || isLoadingMore || draftOperation?.isProcessing === true}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden tablet:!block">Refresh</span>
            </Button>
          )}
        </div>

        <Tabs
          tabs={journalTabs}
          activeTab={activeTab}
          onTabChange={changeTab}
          variant="primary"
          disabled={draftOperation?.isProcessing === true}
        />
      </div>

      <JournalTabContent
        activeTab={activeTab}
        entries={entries}
        draftOperation={draftOperation}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onOpenOrCreateDraft={openOrCreateDraft}
        onLoadMore={loadMoreCandidates}
        isLoading={isLoading}
        loadError={loadError}
        onRetry={refreshCandidates}
      />
    </div>
  );
}
