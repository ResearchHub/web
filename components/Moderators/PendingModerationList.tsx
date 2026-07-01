'use client';

import { ReactNode, useCallback, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DeclineModal } from '@/components/Moderators/DeclineModal';
import { ConfirmModal } from '@/components/modals/ConfirmModal';
import { FeedItemGrantWithApplicants } from '@/components/Feed/items/FeedItemGrantWithApplicants';
import { FeedItemPost } from '@/components/Feed/items/FeedItemPost';
import { FeedItemPaper } from '@/components/Feed/items/FeedItemPaper';
import { SelectionCheckbox } from '@/components/Moderators/SelectionCheckbox';
import {
  PendingModerationService,
  PENDING_MODULE_CONFIG,
  type PendingModule,
} from '@/services/content-moderation.service';
import { usePendingCounts } from '@/components/Moderators/PendingCountsContext';
import { FeedEntry, FeedGrantContent } from '@/types/feed';
import { FlagReasonKey } from '@/types/work';
import { formatRiskScore } from '@/components/profile/riskScoreEvents.utils';
import toast from 'react-hot-toast';

interface PendingModerationListProps {
  module: PendingModule;
}

type ModerationAction = 'approve' | 'decline';
type DeclineData = { reasonChoice: FlagReasonKey; reason: string };
type SelectablePendingEntry = { entryId: string; contentId: number };

const BULK_ACTION_BATCH_SIZE = 5;

function getContentId(module: PendingModule, entry: FeedEntry): number | undefined {
  if (module === 'funding_opportunities') {
    return (entry.content as FeedGrantContent).grant?.id;
  }
  return entry.content.id;
}

function getSelectableEntries(
  module: PendingModule,
  entries: FeedEntry[]
): SelectablePendingEntry[] {
  return entries.flatMap((entry) => {
    const contentId = getContentId(module, entry);
    return contentId == null ? [] : [{ entryId: entry.id, contentId }];
  });
}

function getGrantEntryWithRiskScore(entry: FeedEntry): FeedEntry {
  if (entry.riskScore == null) return entry;

  const content = entry.content as FeedGrantContent;
  const { display, label, hasScore } = formatRiskScore(entry.riskScore, false);
  const riskScoreText = hasScore ? `${display} (${label})` : display;
  const organization = [content.grant?.organization || content.organization, riskScoreText]
    .filter(Boolean)
    .join(' | ');

  return {
    ...entry,
    content: {
      ...content,
      organization,
      grant: {
        ...content.grant,
        organization,
      },
    },
  };
}

function renderPendingGrantItem(entry: FeedEntry, footer: ReactNode): ReactNode {
  return (
    <>
      <div className="[&>div]:rounded-b-none [&>div>div:last-child]:hidden">
        <FeedItemGrantWithApplicants entry={getGrantEntryWithRiskScore(entry)} />
      </div>
      {footer && (
        <div className="-mt-px overflow-hidden rounded-b-[14px] border border-gray-200 border-t-gray-100 bg-white">
          {footer}
        </div>
      )}
    </>
  );
}

function renderFeedItem(module: PendingModule, entry: FeedEntry, footer: ReactNode): ReactNode {
  const commonProps = { entry, showActions: false, footer };
  switch (module) {
    case 'funding_opportunities':
      return renderPendingGrantItem(entry, footer);
    case 'journal_entries':
      return <FeedItemPaper {...commonProps} />;
    case 'proposals':
    case 'posts':
    default:
      return <FeedItemPost {...commonProps} showHeader={false} />;
  }
}

async function runModerationBatch({
  entries,
  moderate,
  onProgress,
}: {
  entries: SelectablePendingEntry[];
  moderate: (entry: SelectablePendingEntry) => Promise<void>;
  onProgress: () => void;
}): Promise<Set<string>> {
  const succeededEntryIds = new Set<string>();

  for (let index = 0; index < entries.length; index += BULK_ACTION_BATCH_SIZE) {
    const batch = entries.slice(index, index + BULK_ACTION_BATCH_SIZE);
    const results = await Promise.allSettled(batch.map(moderate));

    results.forEach((result, batchIndex) => {
      if (result.status === 'fulfilled') {
        succeededEntryIds.add(batch[batchIndex].entryId);
      }
      onProgress();
    });
  }

  return succeededEntryIds;
}

function BulkProcessingOverlay({
  action,
  processed,
  total,
}: Readonly<{
  action: ModerationAction;
  processed: number;
  total: number;
}>) {
  const actionLabel = action === 'approve' ? 'Approving' : 'Declining';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/30 px-4"
      role="status"
      aria-live="polite"
      aria-label={`${actionLabel} selected pending submissions`}
    >
      <div className="w-full max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
          <RefreshCw className="h-6 w-6 animate-spin text-primary-600" />
        </div>
        <h2 className="text-base font-semibold text-gray-900">
          {actionLabel} selected submissions
        </h2>
        <p className="mt-2 text-sm text-gray-600">
          Processing {Math.min(processed, total)} of {total}. Please keep this page open.
        </p>
      </div>
    </div>
  );
}

function PendingModerationSkeleton({ count = 3 }: Readonly<{ count?: number }>) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <div
          key={`pending-moderation-skeleton-${index}`}
          className="bg-white border border-gray-200 rounded-lg p-6 animate-pulse"
        >
          <div className="h-5 bg-gray-200 rounded w-2/3 mb-3" />
          <div className="h-4 bg-gray-100 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-100 rounded w-full mb-2" />
          <div className="h-4 bg-gray-100 rounded w-4/5" />
        </div>
      ))}
    </div>
  );
}

export function PendingModerationList({ module }: Readonly<PendingModerationListProps>) {
  const { itemLabel, tabLabel } = PENDING_MODULE_CONFIG[module];
  const { refreshPendingCounts } = usePendingCounts();
  const [entries, setEntries] = useState<FeedEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [actioningId, setActioningId] = useState<number | null>(null);
  const [declineTargetId, setDeclineTargetId] = useState<number | null>(null);
  const [selectedEntryIds, setSelectedEntryIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<ModerationAction | null>(null);
  const [bulkProcessedCount, setBulkProcessedCount] = useState(0);
  const [bulkTotalCount, setBulkTotalCount] = useState(0);
  const [showBulkApproveConfirm, setShowBulkApproveConfirm] = useState(false);
  const [showBulkDeclineModal, setShowBulkDeclineModal] = useState(false);
  const { ref: loadMoreRef, inView: isLoadMoreInView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  const fetchEntries = useCallback(
    async (pageToLoad = 1, append = false) => {
      if (append) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      try {
        const response = await PendingModerationService.fetchPending(module, pageToLoad);
        setEntries((currentEntries) =>
          append ? [...currentEntries, ...response.entries] : response.entries
        );
        setHasMore(response.hasMore);
        setPage(pageToLoad);
        if (!append) {
          setSelectedEntryIds(new Set());
        }
      } catch {
        toast.error('Failed to load pending submissions');
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
      }
    },
    [module]
  );

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  const refreshPendingData = useCallback(async () => {
    setIsRefreshing(true);
    await Promise.all([
      refreshPendingCounts({ force: true }).catch(() => undefined),
      fetchEntries(1),
    ]);
  }, [fetchEntries, refreshPendingCounts]);

  const selectableEntries = getSelectableEntries(module, entries);
  const selectedEntries = selectableEntries.filter((entry) => selectedEntryIds.has(entry.entryId));
  const selectedCount = selectedEntries.length;
  const selectableCount = selectableEntries.length;
  const selectedItemLabel = selectedCount === 1 ? itemLabel.toLowerCase() : tabLabel.toLowerCase();
  const allLoadedEntriesSelected = selectableCount > 0 && selectedCount === selectableCount;
  const someLoadedEntriesSelected = selectedCount > 0 && selectedCount < selectableCount;
  const isBulkActioning = bulkAction != null;

  const loadNextPage = useCallback(async () => {
    if (!hasMore || isLoadingMore) return;
    await fetchEntries(page + 1, true);
  }, [fetchEntries, hasMore, isLoadingMore, page]);

  useEffect(() => {
    if (!isLoadMoreInView || isLoading || isLoadingMore || isBulkActioning || !hasMore) return;
    loadNextPage();
  }, [hasMore, isBulkActioning, isLoadMoreInView, isLoading, isLoadingMore, loadNextPage]);

  const approveEntry = async (contentId: number) => {
    setActioningId(contentId);
    try {
      await PendingModerationService.approve(module, contentId);
      toast.success(`${itemLabel} approved`);
      await refreshPendingData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to approve ${itemLabel}`);
    } finally {
      setActioningId(null);
    }
  };

  const declineEntry = async ({ reasonChoice, reason }: DeclineData) => {
    if (declineTargetId == null) return;

    setActioningId(declineTargetId);
    try {
      await PendingModerationService.decline(module, declineTargetId, {
        reason_choice: reasonChoice,
        ...(reason && { reason }),
      });
      toast.success(`${itemLabel} declined`);
      setDeclineTargetId(null);
      await refreshPendingData();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : `Failed to decline ${itemLabel}`);
    } finally {
      setActioningId(null);
    }
  };

  const toggleEntrySelection = (entryId: string) => {
    if (isBulkActioning) return;

    setSelectedEntryIds((currentIds) => {
      const nextIds = new Set(currentIds);
      if (nextIds.has(entryId)) {
        nextIds.delete(entryId);
      } else {
        nextIds.add(entryId);
      }
      return nextIds;
    });
  };

  const toggleAllLoadedEntries = () => {
    if (isBulkActioning) return;

    setSelectedEntryIds((currentIds) => {
      if (allLoadedEntriesSelected) return new Set();

      const nextIds = new Set(currentIds);
      selectableEntries.forEach((entry) => nextIds.add(entry.entryId));
      return nextIds;
    });
  };

  const clearSelection = () => setSelectedEntryIds(new Set());

  const moderateSelectedEntries = async (action: ModerationAction, declineData?: DeclineData) => {
    if (selectedEntries.length === 0) return;

    const entriesToModerate = selectedEntries;
    setBulkAction(action);
    setBulkProcessedCount(0);
    setBulkTotalCount(entriesToModerate.length);

    try {
      const succeededEntryIds = await runModerationBatch({
        entries: entriesToModerate,
        onProgress: () => setBulkProcessedCount((count) => count + 1),
        moderate: (entry) => {
          if (action === 'approve') {
            return PendingModerationService.approve(module, entry.contentId);
          }

          if (!declineData) {
            return Promise.reject(new Error('Decline reason is required'));
          }

          return PendingModerationService.decline(module, entry.contentId, {
            reason_choice: declineData.reasonChoice,
            ...(declineData.reason && { reason: declineData.reason }),
          });
        },
      });

      const failureCount = entriesToModerate.length - succeededEntryIds.size;
      const actionPastTense = action === 'approve' ? 'approved' : 'declined';

      if (failureCount === 0) {
        toast.success(`${entriesToModerate.length} ${tabLabel.toLowerCase()} ${actionPastTense}`);
        clearSelection();
        setShowBulkDeclineModal(false);
      } else {
        toast.error(
          `${failureCount} of ${entriesToModerate.length} ${tabLabel.toLowerCase()} failed to ${action}`
        );
        setSelectedEntryIds((currentIds) => {
          const nextIds = new Set(currentIds);
          succeededEntryIds.forEach((entryId) => nextIds.delete(entryId));
          return nextIds;
        });
      }

      await refreshPendingData();
    } finally {
      setBulkAction(null);
      setBulkProcessedCount(0);
      setBulkTotalCount(0);
    }
  };

  const renderFooter = (entry: FeedEntry) => {
    const contentId = getContentId(module, entry);
    if (contentId == null) return undefined;

    const isActioning = actioningId === contentId;
    const isSelected = selectedEntryIds.has(entry.id);

    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <SelectionCheckbox
          checked={isSelected}
          onChange={() => toggleEntrySelection(entry.id)}
          ariaLabel={isSelected ? `Deselect ${itemLabel}` : `Select ${itemLabel}`}
          disabled={isActioning || isBulkActioning}
        />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => approveEntry(contentId)}
          disabled={isActioning || isBulkActioning}
          className="text-green-600 hover:text-green-700 hover:bg-green-50"
        >
          <CheckCircle className="h-4 w-4 mr-1" />
          {isActioning ? 'Approving...' : 'Approve'}
        </Button>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDeclineTargetId(contentId)}
          disabled={isActioning || isBulkActioning}
          className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <XCircle className="h-4 w-4 mr-1" />
          Decline
        </Button>
      </div>
    );
  };

  return (
    <>
      {bulkAction && (
        <BulkProcessingOverlay
          action={bulkAction}
          processed={bulkProcessedCount}
          total={bulkTotalCount}
        />
      )}

      <div className="max-w-4xl mx-auto mb-4 flex justify-end">
        <Button variant="outlined" size="sm" onClick={refreshPendingData} disabled={isRefreshing}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden tablet:!block">Refresh</span>
        </Button>
      </div>

      <div className="max-w-4xl mx-auto space-y-4">
        {!isLoading && selectableCount > 0 && (
          <div className="sticky top-[25px] z-10 flex flex-wrap items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
            <div className="mr-auto flex items-center gap-3">
              <SelectionCheckbox
                checked={allLoadedEntriesSelected}
                indeterminate={someLoadedEntriesSelected}
                onChange={toggleAllLoadedEntries}
                ariaLabel={allLoadedEntriesSelected ? 'Deselect all' : 'Select all'}
                disabled={isBulkActioning}
              />
              <span className="text-sm text-gray-700">
                {selectedCount === 0
                  ? `Select all loaded (${selectableCount})`
                  : `${selectedCount} of ${selectableCount} loaded selected`}
              </span>
            </div>

            {selectedCount > 0 && (
              <div className="flex flex-wrap items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSelection}
                  disabled={isBulkActioning}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Clear
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkApproveConfirm(true)}
                  disabled={isBulkActioning}
                  className="text-green-600 hover:text-green-700 hover:bg-green-50"
                >
                  <CheckCircle className="h-4 w-4 mr-1" />
                  {bulkAction === 'approve'
                    ? 'Approving...'
                    : `Approve ${allLoadedEntriesSelected ? 'all' : 'selected'} (${selectedCount})`}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowBulkDeclineModal(true)}
                  disabled={isBulkActioning}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4 mr-1" />
                  {bulkAction === 'decline'
                    ? 'Declining...'
                    : `Decline ${allLoadedEntriesSelected ? 'all' : 'selected'} (${selectedCount})`}
                </Button>
              </div>
            )}
          </div>
        )}

        {isLoading && <PendingModerationSkeleton />}

        {!isLoading && entries.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
              <p className="text-gray-600 text-center max-w-md">
                No pending submissions require your review at the moment.
              </p>
            </div>
          </div>
        )}

        {!isLoading &&
          entries.map((entry) => (
            <div key={entry.id}>{renderFeedItem(module, entry, renderFooter(entry))}</div>
          ))}

        {isLoadingMore && <PendingModerationSkeleton />}

        {!isLoading && !isLoadingMore && !isBulkActioning && hasMore && (
          <div ref={loadMoreRef} className="h-10" />
        )}
      </div>

      {declineTargetId != null && (
        <DeclineModal
          isOpen={declineTargetId != null}
          onClose={() => setDeclineTargetId(null)}
          onConfirm={declineEntry}
          isSubmitting={actioningId === declineTargetId}
          itemLabel={itemLabel}
        />
      )}

      <ConfirmModal
        isOpen={showBulkApproveConfirm}
        onClose={() => setShowBulkApproveConfirm(false)}
        onConfirm={() => moderateSelectedEntries('approve')}
        title={`Approve ${selectedCount} selected ${selectedItemLabel}?`}
        message={`This will approve ${selectedCount} selected ${selectedItemLabel}.`}
        confirmText={`Approve ${selectedCount}`}
        confirmButtonClass="bg-green-600 hover:bg-green-700"
      />

      {showBulkDeclineModal && (
        <DeclineModal
          isOpen={showBulkDeclineModal}
          onClose={() => setShowBulkDeclineModal(false)}
          onConfirm={(data) => moderateSelectedEntries('decline', data)}
          isSubmitting={bulkAction === 'decline'}
          itemLabel={itemLabel}
          title={`Decline ${selectedCount} selected ${selectedItemLabel}`}
          reasonPrompt={`I am declining ${
            selectedCount === 1 ? 'this' : 'these'
          } ${selectedCount} selected ${selectedItemLabel} because of:`}
          confirmText={`Decline ${selectedCount}`}
          submittingText="Declining..."
        />
      )}
    </>
  );
}
