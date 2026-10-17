'use client';

import { useCallback, useEffect, useMemo, useState, type MouseEvent, type ReactNode } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  EXPERT_FINDER_OUTREACH_PAGE_SIZE,
  PAGE_QUERY,
  parsePageQueryParam,
} from '@/app/expert-finder/lib/paginationParams';
import { TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { Filter, Loader2, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { useCancelQueuedOutreachCampaign, useGeneratedEmails } from '@/hooks/useExpertFinder';
import { useScreenSize } from '@/hooks/useScreenSize';
import { OutreachTable, OUTREACH_TABLE_COLUMNS } from './OutreachTable';
import { OutreachMobileCard } from './OutreachMobileCard';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import { toast } from 'react-hot-toast';
import { cn } from '@/utils/styles';
import type { GeneratedEmail } from '@/types/expertFinder';

const STATUS_QUERY = 'status';

const STATUS_FILTERS = [
  { value: 'all', label: 'All statuses', apiStatus: undefined },
  { value: 'sending', label: 'Pending delivery', apiStatus: 'sending' },
  { value: 'sent', label: 'Sent', apiStatus: 'sent' },
  { value: 'bounced', label: 'Bounced', apiStatus: 'bounced' },
  { value: 'failed', label: 'Failed', apiStatus: 'failed' },
] as const;

type StatusFilterValue = (typeof STATUS_FILTERS)[number]['value'];

function parseStatusFilter(raw: string | null): StatusFilterValue {
  const match = STATUS_FILTERS.find((f) => f.value === raw);
  return match?.value ?? 'all';
}

const DEFAULT_EMPTY_MESSAGE = (
  <>
    <p className="text-gray-600 mb-2">No outreach yet</p>
    <p className="text-sm text-gray-500">Select experts from a search and click Send.</p>
  </>
);

const CANCEL_QUEUED_MAX_IDS = 1000;

function resolveCancelCampaignId(
  email: GeneratedEmail,
  listCampaignId?: string | number
): number | null {
  if (listCampaignId != null && listCampaignId !== '') {
    const n = Number(listCampaignId);
    return Number.isFinite(n) ? n : null;
  }
  return email.outreachCampaign != null && Number.isFinite(email.outreachCampaign)
    ? email.outreachCampaign
    : null;
}

export interface GeneratedEmailsListProps {
  searchId?: string | number;
  campaignId?: string | number;
  /** Custom empty state when there are no emails. */
  emptyMessage?: ReactNode;
  preserveOutreachTab?: boolean;
  onListChange?: () => void | Promise<void>;
}

export function GeneratedEmailsList({
  searchId,
  campaignId,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
  preserveOutreachTab = searchId != null,
  onListChange,
}: GeneratedEmailsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { mdAndUp } = useScreenSize();
  const pageSize = EXPERT_FINDER_OUTREACH_PAGE_SIZE;

  const statusFilter = parseStatusFilter(searchParams.get(STATUS_QUERY));
  const statusFilterOption =
    STATUS_FILTERS.find((f) => f.value === statusFilter) ?? STATUS_FILTERS[0];

  const pageFromUrl = useMemo(
    () => parsePageQueryParam(searchParams.get(PAGE_QUERY)),
    [searchParams]
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [{ isLoading: cancelBusy }, cancelQueued] = useCancelQueuedOutreachCampaign();

  const offset = (pageFromUrl - 1) * pageSize;
  const [{ emails, pagination, isLoading, error }, refetch] = useGeneratedEmails({
    searchId,
    campaignId,
    status: statusFilterOption.apiStatus,
    limit: pageSize,
    offset,
  });

  const selectableIds = useMemo(
    () =>
      new Set(
        emails
          .filter((e) => e.status === 'sending' && resolveCancelCampaignId(e, campaignId) != null)
          .map((e) => e.id)
      ),
    [campaignId, emails]
  );
  const selectedPendingIds = useMemo(
    () => [...selectedIds].filter((id) => selectableIds.has(id)),
    [selectedIds, selectableIds]
  );

  const totalPages = Math.max(1, Math.ceil(pagination.total / pageSize));
  const page = pagination.total > 0 ? Math.min(pageFromUrl, totalPages) : pageFromUrl;

  const pushListState = useCallback(
    (next: { status?: StatusFilterValue; page?: number }, replace = false) => {
      const params = new URLSearchParams(searchParams.toString());
      if (preserveOutreachTab) params.set('tab', TAB_OUTREACH);

      const nextStatus = next.status ?? statusFilter;
      if (nextStatus === 'all') params.delete(STATUS_QUERY);
      else params.set(STATUS_QUERY, nextStatus);

      const nextPage = next.page ?? pageFromUrl;
      if (nextPage <= 1) params.delete(PAGE_QUERY);
      else params.set(PAGE_QUERY, String(nextPage));

      const qs = params.toString();
      const href = qs ? `${pathname}?${qs}` : pathname;
      if (replace) router.replace(href, { scroll: false });
      else router.push(href, { scroll: false });
    },
    [pageFromUrl, pathname, preserveOutreachTab, router, searchParams, statusFilter]
  );

  useEffect(() => {
    if (isLoading || pagination.total <= 0) return;
    if (pageFromUrl <= totalPages) return;
    pushListState({ page: totalPages }, true);
  }, [isLoading, pageFromUrl, pagination.total, pushListState, totalPages]);

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pageFromUrl, statusFilter, searchId, campaignId]);

  const selectablePageIds = useMemo(() => [...selectableIds], [selectableIds]);
  const allPendingSelected =
    selectablePageIds.length > 0 && selectablePageIds.every((id) => selectedIds.has(id));

  const handleSelectionChange = useCallback((ids: Set<number>) => {
    setSelectedIds(ids);
  }, []);

  const handleSelectAllPending = useCallback(() => {
    if (allPendingSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectablePageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        selectablePageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [allPendingSelected, selectablePageIds]);

  const handleMobileToggleSelect = useCallback(
    (emailId: number, e: MouseEvent) => {
      e.stopPropagation();
      if (!selectableIds.has(emailId)) return;
      setSelectedIds((prev) => {
        const next = new Set(prev);
        if (next.has(emailId)) next.delete(emailId);
        else next.add(emailId);
        return next;
      });
    },
    [selectableIds]
  );

  const handleCancelConfirm = useCallback(async () => {
    if (selectedPendingIds.length === 0) return;

    const idsByCampaign = new Map<number, number[]>();
    for (const email of emails) {
      if (!selectedPendingIds.includes(email.id)) continue;
      const cid = resolveCancelCampaignId(email, campaignId);
      if (cid == null) continue;
      const list = idsByCampaign.get(cid) ?? [];
      list.push(email.id);
      idsByCampaign.set(cid, list);
    }

    if (idsByCampaign.size === 0) {
      toast.error('Nothing could be removed from the sending queue.');
      return;
    }

    try {
      let cancelled = 0;
      let skipped = 0;
      for (const [cid, ids] of idsByCampaign) {
        const chunk = ids.slice(0, CANCEL_QUEUED_MAX_IDS);
        const result = await cancelQueued(cid, { generated_email_ids: chunk });
        cancelled += result.cancelled;
        skipped += result.skippedIds.length;
      }

      if (cancelled > 0 && skipped === 0) {
        toast.success(`Removed ${cancelled} from the sending queue.`);
      } else if (cancelled > 0) {
        toast.success(`Removed ${cancelled}; skipped ${skipped}.`);
      } else {
        toast.error('Nothing was removed from the sending queue.');
      }

      setSelectedIds(new Set());
      setShowCancelConfirm(false);
      await refetch();
      await onListChange?.();
    } catch {
      toast.error('Failed to remove from the sending queue.');
    }
  }, [campaignId, cancelQueued, emails, onListChange, refetch, selectedPendingIds]);

  const statusFilterControl = (
    <BaseMenu
      align="start"
      trigger={
        <Button
          type="button"
          variant="outlined"
          size="sm"
          className={cn(
            'gap-2',
            statusFilter !== 'all' && 'border-primary-300 bg-primary-50 text-primary-900'
          )}
          aria-label={
            statusFilter === 'all'
              ? 'Filter by status'
              : `Filter by status: ${statusFilterOption.label}`
          }
        >
          <Filter className="h-4 w-4 shrink-0" aria-hidden />
          {statusFilter !== 'all' ? (
            <span className="truncate max-w-[10rem]">{statusFilterOption.label}</span>
          ) : null}
        </Button>
      }
    >
      {STATUS_FILTERS.map((option) => (
        <BaseMenuItem
          key={option.value}
          onClick={() => pushListState({ status: option.value, page: 1 })}
          className={cn(
            statusFilter === option.value && 'bg-primary-50 text-primary-900 font-medium'
          )}
        >
          {option.label}
        </BaseMenuItem>
      ))}
    </BaseMenu>
  );

  const listHeader = (
    <div className="mb-4 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          {statusFilterControl}
          <h2 className="text-lg font-semibold text-gray-900">Outreach ({pagination.total})</h2>
        </div>
        {selectedPendingIds.length > 0 ? (
          <Button
            variant="destructive"
            size="sm"
            className="gap-2"
            disabled={cancelBusy}
            onClick={() => setShowCancelConfirm(true)}
          >
            {cancelBusy ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
            ) : (
              <Trash2 className="h-4 w-4" aria-hidden />
            )}
            Remove from sending queue
          </Button>
        ) : null}
      </div>
      {selectablePageIds.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2">
          {allPendingSelected ? (
            <Button variant="outlined" size="sm" onClick={() => setSelectedIds(new Set())}>
              Unselect all
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="sm"
              onClick={handleSelectAllPending}
              disabled={selectablePageIds.length === 0}
            >
              Select all pending
            </Button>
          )}
          <span className="text-sm text-gray-600">
            {selectedPendingIds.length} pending selected
          </span>
        </div>
      ) : null}
    </div>
  );

  const resolvedEmptyMessage =
    statusFilter === 'all' ? (
      emptyMessage
    ) : (
      <p className="text-gray-600">No messages with status “{statusFilterOption.label}”.</p>
    );

  if (error) {
    return (
      <div className="mb-4">
        <Alert variant="error">{error}</Alert>
      </div>
    );
  }

  if (isLoading && emails.length === 0) {
    return (
      <div className="p-4">
        {mdAndUp ? (
          <TableSkeleton columns={OUTREACH_TABLE_COLUMNS} rowCount={pageSize} />
        ) : (
          <ListCardSkeleton rowCount={pageSize} />
        )}
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <>
        {listHeader}
        <div className="px-6 py-12 text-center">{resolvedEmptyMessage}</div>
      </>
    );
  }

  return (
    <>
      {listHeader}

      {mdAndUp ? (
        <div className="overflow-x-auto">
          <OutreachTable
            emails={emails}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
            selectableIds={selectableIds}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email, index) => (
            <OutreachMobileCard
              key={email.id ?? index}
              email={email}
              className="shadow-sm"
              selected={selectedIds.has(email.id)}
              selectable={selectableIds.has(email.id)}
              onToggleSelect={handleMobileToggleSelect}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <PaginationButton
              label="Previous"
              onClick={() => pushListState({ page: page - 1 })}
              disabled={page <= 1 || isLoading}
              isLoading={isLoading}
            />
            <PaginationButton
              label="Next"
              onClick={() => pushListState({ page: page + 1 })}
              disabled={page >= totalPages || isLoading}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={showCancelConfirm}
        onClose={() => {
          if (!cancelBusy) setShowCancelConfirm(false);
        }}
        title="Remove from sending queue?"
        description={`Remove ${selectedPendingIds.length} item${
          selectedPendingIds.length === 1 ? '' : 's'
        } from the sending queue? They will no longer be sent.`}
        confirmLabel="Remove from sending queue"
        confirmVariant="destructive"
        confirmIcon={<Trash2 className="h-4 w-4" aria-hidden />}
        isConfirming={cancelBusy}
        onConfirm={handleCancelConfirm}
      />
    </>
  );
}
