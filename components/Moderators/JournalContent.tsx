'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, CheckCircle, FilePlus2, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';
import { FeedItemPost } from '@/components/Feed/items/FeedItemPost';
import { Tabs } from '@/components/ui/Tabs';
import { NoteService } from '@/services/note.service';
import {
  RegisteredReportModerationError,
  RegisteredReportModerationService,
  type RegisteredReportDraft,
} from '@/services/registered-report-moderation.service';
import type { FeedEntry, FeedPostContent } from '@/types/feed';
import { useRouter } from 'next/navigation';

type JournalTab = 'eligible-proposals' | 'registered-reports';

const journalTabs = [
  { id: 'eligible-proposals', label: 'Eligible Proposals' },
  { id: 'registered-reports', label: 'Registered Reports' },
];

function getProposalId(entry: FeedEntry): number {
  return (entry.content as FeedPostContent).id;
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

export function JournalContent() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<JournalTab>('eligible-proposals');
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [hasMore, setHasMore] = useState(false);
  const [nextPage, setNextPage] = useState(2);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [creatingProposalId, setCreatingProposalId] = useState<number | null>(null);
  const [draftToOpen, setDraftToOpen] = useState<RegisteredReportDraft | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [accessError, setAccessError] = useState<string | null>(null);

  const loadCandidates = useCallback(async (page: number, replaceEntries: boolean) => {
    if (replaceEntries) {
      setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }
    setLoadError(null);

    try {
      const response = await RegisteredReportModerationService.fetchCandidates(page);
      setEntries((currentEntries) =>
        replaceEntries ? response.entries : [...currentEntries, ...response.entries]
      );
      setHasMore(response.hasMore);
      setNextPage(page + 1);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to load eligible proposals. Please try again.';

      if (
        error instanceof RegisteredReportModerationError &&
        (error.status === 401 || error.status === 403)
      ) {
        setAccessError(message);
      } else {
        setLoadError(message);
      }
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadCandidates(1, true);
  }, [loadCandidates]);

  useEffect(() => {
    if (!draftToOpen) return;

    let isCurrent = true;

    const openDraft = async () => {
      try {
        const note = await NoteService.getNote(draftToOpen.noteId.toString());
        if (!note.organization?.slug) {
          throw new Error('The draft was created, but its notebook location was unavailable.');
        }
        if (isCurrent) {
          router.replace(`/notebook/${note.organization.slug}/${note.id}`);
        }
      } catch (error) {
        if (!isCurrent) return;
        toast.error(
          error instanceof Error
            ? error.message
            : 'The draft was created, but it could not be opened.'
        );
        setDraftToOpen(null);
      }
    };

    openDraft();

    return () => {
      isCurrent = false;
    };
  }, [draftToOpen, router]);

  const refreshCandidates = async () => {
    setIsRefreshing(true);
    await loadCandidates(1, true);
  };

  const loadMoreCandidates = async () => {
    if (!hasMore || isLoadingMore) return;
    await loadCandidates(nextPage, false);
  };

  const createDraft = async (proposalId: number) => {
    setCreatingProposalId(proposalId);

    try {
      const draft = await RegisteredReportModerationService.createDraft(proposalId);
      setEntries((currentEntries) =>
        currentEntries.filter((entry) => getProposalId(entry) !== proposalId)
      );
      setDraftToOpen(draft);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Failed to create the Registered Report draft.';

      if (
        error instanceof RegisteredReportModerationError &&
        (error.status === 401 || error.status === 403)
      ) {
        setAccessError(message);
      } else {
        toast.error(message);
      }

      if (error instanceof RegisteredReportModerationError && error.status === 400) {
        await refreshCandidates();
      }
    } finally {
      setCreatingProposalId(null);
    }
  };

  const changeTab = (tabId: string) => {
    setActiveTab(tabId as JournalTab);
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
              disabled={isRefreshing || isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden tablet:!block">Refresh</span>
            </Button>
          )}
        </div>

        <Tabs tabs={journalTabs} activeTab={activeTab} onTabChange={changeTab} variant="primary" />
      </div>

      {activeTab === 'registered-reports' ? (
        <div className="py-12 text-center">
          <h2 className="text-lg font-medium text-gray-900">Registered Reports</h2>
          <p className="mt-2 text-gray-600">Published Registered Reports will appear here soon.</p>
        </div>
      ) : (
        <div className="flex-1 pt-6">
          {draftToOpen && (
            <div className="mb-4 flex items-center gap-2 rounded-lg border border-primary-100 bg-primary-50 px-4 py-3 text-sm text-primary-800">
              <Loader2 className="h-4 w-4 animate-spin" />
              Opening Registered Report draft…
            </div>
          )}

          {isLoading ? (
            <LoadingCandidates />
          ) : loadError ? (
            <div className="py-12 text-center">
              <AlertCircle className="mx-auto mb-4 h-10 w-10 text-red-500" />
              <h2 className="text-lg font-semibold text-gray-900">
                Unable to load eligible proposals
              </h2>
              <p className="mt-2 text-sm text-gray-600">{loadError}</p>
              <Button className="mt-5" onClick={refreshCandidates}>
                Try again
              </Button>
            </div>
          ) : entries.length === 0 ? (
            <EmptyCandidates />
          ) : (
            <div className="mx-auto max-w-4xl space-y-4">
              {entries.map((entry) => {
                const proposalId = getProposalId(entry);
                const isCreating = creatingProposalId === proposalId;

                return (
                  <FeedItemPost
                    key={entry.id}
                    entry={entry}
                    showActions={false}
                    showHeader={false}
                    footer={
                      <div className="flex items-center border-t border-gray-100 px-4 py-3">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => createDraft(proposalId)}
                          disabled={isCreating || draftToOpen !== null}
                          className="gap-1.5"
                        >
                          {isCreating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <FilePlus2 className="h-4 w-4" />
                          )}
                          {isCreating ? 'Creating draft…' : 'Create Registered Report draft'}
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
                    onClick={loadMoreCandidates}
                    disabled={isLoadingMore || draftToOpen !== null}
                  >
                    {isLoadingMore ? 'Loading…' : 'Load more'}
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
