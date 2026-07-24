'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, ArrowRight, CheckCircle, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { FeedItemPost } from '@/components/Feed/items/FeedItemPost';
import { Tabs } from '@/components/ui/Tabs';
import { NoteService } from '@/services/note.service';
import {
  RegisteredReportModerationError,
  RegisteredReportModerationService,
} from '@/services/registered-report-moderation.service';
import type { FeedEntry } from '@/types/feed';
import { useRouter } from 'next/navigation';

type JournalTab = 'eligible-proposals' | 'registered-reports';

const journalTabs = [
  { id: 'eligible-proposals', label: 'Eligible Proposals' },
  { id: 'registered-reports', label: 'Registered Reports' },
];

function getProposalId(entry: FeedEntry): number | null {
  return entry.content.contentType === 'PREREGISTRATION' ? entry.content.id : null;
}

function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function isModeratorAccessError(error: unknown): error is RegisteredReportModerationError {
  return (
    error instanceof RegisteredReportModerationError &&
    (error.status === 401 || error.status === 403)
  );
}

function LoadingCandidates() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((index) => (
        <div key={index} className="animate-pulse rounded-lg border border-gray-200 bg-white p-6">
          <div className="mb-3 h-5 w-2/3 rounded bg-gray-200" />
          <div className="mb-4 h-4 w-1/3 rounded bg-gray-100" />
          <div className="mb-2 h-4 w-full rounded bg-gray-100" />
          <div className="h-4 w-4/5 rounded bg-gray-100" />
        </div>
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
  creatingProposalId: number | null;
  hasMore: boolean;
  isLoadingMore: boolean;
  onCreateDraft: (proposalId: number) => Promise<void>;
  onLoadMore: () => Promise<void>;
}

function CandidateList({
  entries,
  creatingProposalId,
  hasMore,
  isLoadingMore,
  onCreateDraft,
  onLoadMore,
}: Readonly<CandidateListProps>) {
  const isDraftOperationInProgress = creatingProposalId !== null;

  return (
    <div className="mx-auto max-w-4xl space-y-4">
      {entries.map((entry) => {
        const proposalId = getProposalId(entry);
        if (!proposalId) return null;

        const isCreating = creatingProposalId === proposalId;

        return (
          <FeedItemPost
            key={entry.id}
            entry={entry}
            showActions={false}
            showHeader={false}
            footer={
              <div className="flex items-center justify-end border-t border-gray-100 bg-gray-50 px-3 py-1.5">
                <Button
                  variant="dark"
                  size="sm"
                  onClick={() => onCreateDraft(proposalId)}
                  disabled={isDraftOperationInProgress}
                  className="gap-1"
                >
                  {isCreating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Create Registered Report
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
            disabled={isLoadingMore || isDraftOperationInProgress}
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

  if (candidateListProps.entries.length === 0) {
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
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JournalTab>('eligible-proposals');
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [creatingProposalId, setCreatingProposalId] = useState<number | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);
  const candidateRequestIdRef = useRef(0);
  const isCreatingDraftRef = useRef(false);

  const loadCandidates = useCallback(async (page: number, replaceEntries: boolean) => {
    const requestId = ++candidateRequestIdRef.current;

    if (replaceEntries) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setLoadError(null);

    try {
      const response = await RegisteredReportModerationService.fetchCandidates(page);
      if (requestId !== candidateRequestIdRef.current) return;

      setEntries((currentEntries) =>
        replaceEntries ? response.entries : [...currentEntries, ...response.entries]
      );
      setHasMore(response.hasMore);
      setNextPage(page + 1);
    } catch (error) {
      if (requestId !== candidateRequestIdRef.current) return;

      const message = getErrorMessage(
        error,
        'Failed to load eligible proposals. Please try again.'
      );

      if (isModeratorAccessError(error)) {
        setAccessError(message);
      } else {
        setLoadError(message);
      }
    } finally {
      if (requestId !== candidateRequestIdRef.current) return;

      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates(1, true);
  }, [loadCandidates]);

  const refreshCandidates = () => loadCandidates(1, true);

  const loadMoreCandidates = async () => {
    if (!hasMore || isLoading || isLoadingMore || creatingProposalId !== null) {
      return;
    }

    await loadCandidates(nextPage, false);
  };

  const createDraft = async (proposalId: number) => {
    if (isCreatingDraftRef.current) return;

    isCreatingDraftRef.current = true;
    setCreatingProposalId(proposalId);

    try {
      const noteId = await RegisteredReportModerationService.createDraft(proposalId);
      setEntries((currentEntries) =>
        currentEntries.filter((entry) => getProposalId(entry) !== proposalId)
      );
      const note = await NoteService.getNote(noteId.toString());
      if (!note.organization?.slug) {
        throw new Error('The draft was created, but its notebook location was unavailable.');
      }
      router.replace(`/notebook/${note.organization.slug}/${note.id}`);
    } catch (error) {
      const message = getErrorMessage(error, 'Failed to create the Registered Report draft.');

      if (isModeratorAccessError(error)) {
        setAccessError(message);
      } else {
        toast.error(message);
      }

      if (error instanceof RegisteredReportModerationError && error.status === 400) {
        await refreshCandidates();
      }

      isCreatingDraftRef.current = false;
      setCreatingProposalId(null);
    }
  };

  const changeTab = (tabId: string) => {
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
              disabled={isLoading || isLoadingMore || creatingProposalId !== null}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden tablet:!block">Refresh</span>
            </Button>
          )}
        </div>

        <Tabs tabs={journalTabs} activeTab={activeTab} onTabChange={changeTab} variant="primary" />
      </div>

      <JournalTabContent
        activeTab={activeTab}
        entries={entries}
        creatingProposalId={creatingProposalId}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        onCreateDraft={createDraft}
        onLoadMore={loadMoreCandidates}
        isLoading={isLoading}
        loadError={loadError}
        onRetry={refreshCandidates}
      />
    </div>
  );
}
