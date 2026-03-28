'use client';

import { useState, useCallback, useEffect, useMemo, type MouseEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  EXPERT_FINDER_LIST_PAGE_SIZE,
  PAGE_QUERY,
  parsePageQueryParam,
} from '@/app/expert-finder/lib/paginationParams';
import { TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { Loader2, Mail, MoreVertical, Send, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { BulkSendEmailsModal } from './BulkSendEmailsModal';
import { BulkMarkAsSentModal } from './BulkMarkAsSentModal';
import { BulkDeleteOutreachDraftsModal } from './BulkDeleteOutreachDraftsModal';
import { useGeneratedEmails, useSendEmails } from '@/hooks/useExpertFinder';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useUser } from '@/contexts/UserContext';
import { OutreachTable, OUTREACH_TABLE_COLUMNS } from './OutreachTable';
import { OutreachMobileCard } from './OutreachMobileCard';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import { toast } from 'react-hot-toast';
import { isValidEmail } from '@/utils/validation';
import type { GeneratedEmail } from '@/types/expertFinder';
import { isGeneratedEmailDraftLike } from '@/app/expert-finder/lib/generatedEmailStatus';
import { cn } from '@/utils/styles';

const DEFAULT_EMPTY_MESSAGE = (
  <>
    <p className="text-gray-600 mb-2">No generated emails yet</p>
    <p className="text-sm text-gray-500">
      Generate outreach emails from a search result (Library → open a search → select experts →
      Generate emails).
    </p>
  </>
);

export interface GeneratedEmailsListProps {
  /** When provided, only emails for this search are shown */
  searchId?: string | number;
  /** Row click + table View link target */
  getDetailHref: (email: GeneratedEmail) => string;
  /** Custom empty state content when there are no emails */
  emptyMessage?: React.ReactNode;
}

export function GeneratedEmailsList({
  searchId,
  getDetailHref,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: GeneratedEmailsListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useUser();
  const { mdAndUp } = useScreenSize();
  const pageSize = EXPERT_FINDER_LIST_PAGE_SIZE;

  const pageFromUrl = useMemo(
    () => parsePageQueryParam(searchParams.get(PAGE_QUERY)),
    [searchParams]
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showSendConfirm, setShowSendConfirm] = useState(false);
  const [showBulkMarkSentConfirm, setShowBulkMarkSentConfirm] = useState(false);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkReplyTo, setBulkReplyTo] = useState('');

  const offset = (pageFromUrl - 1) * pageSize;
  const [{ emails, pagination, isLoading, error }, refetch] = useGeneratedEmails({
    searchId,
    limit: pageSize,
    offset,
  });
  const [{ isLoading: isSending }, sendEmails] = useSendEmails();

  const totalPages = Math.max(1, Math.ceil(pagination.total / pageSize));
  const page = pagination.total > 0 ? Math.min(pageFromUrl, totalPages) : pageFromUrl;

  useEffect(() => {
    if (isLoading || pagination.total <= 0) return;
    if (pageFromUrl <= totalPages) return;
    const params = new URLSearchParams(searchParams.toString());
    params.set('tab', TAB_OUTREACH);
    if (totalPages <= 1) params.delete(PAGE_QUERY);
    else params.set(PAGE_QUERY, String(totalPages));
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [isLoading, pageFromUrl, pagination.total, pathname, router, searchParams, totalPages]);

  const pushOutreachPage = useCallback(
    (nextPage: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set('tab', TAB_OUTREACH);
      if (nextPage <= 1) params.delete(PAGE_QUERY);
      else params.set(PAGE_QUERY, String(nextPage));
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams]
  );

  useEffect(() => {
    setSelectedIds(new Set());
  }, [pageFromUrl]);

  const pageIds = emails.map((e) => e.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

  const selectedDraftIdsOnPage = useMemo(
    () =>
      emails
        .filter((e) => selectedIds.has(e.id) && isGeneratedEmailDraftLike(e.status))
        .map((e) => e.id),
    [emails, selectedIds]
  );

  const bulkActionsBusy = isSending;
  const canBulkActOnDrafts = selectedDraftIdsOnPage.length > 0 && !bulkActionsBusy;

  const handleSelectionChange = useCallback((ids: Set<number>) => {
    setSelectedIds(ids);
  }, []);

  const handleSelectAll = useCallback(() => {
    if (allSelected) {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.add(id));
        return next;
      });
    }
  }, [allSelected, pageIds]);

  const handleRowClick = (email: GeneratedEmail) => {
    router.push(getDetailHref(email));
  };

  const handleSendClick = () => {
    setShowSendConfirm(true);
  };

  useEffect(() => {
    if (showSendConfirm && user?.email && !bulkReplyTo.trim()) {
      setBulkReplyTo(user.email);
    }
  }, [showSendConfirm, user?.email]);

  const handleBulkListRefresh = useCallback(async () => {
    setSelectedIds(new Set());
    await refetch();
  }, [refetch]);

  const handleSendConfirm = async () => {
    const ids = emails
      .filter((e) => selectedIds.has(e.id) && isGeneratedEmailDraftLike(e.status))
      .map((e) => e.id);
    if (ids.length === 0) {
      toast.error('Select at least one draft to send.');
      return;
    }
    const trimmedReplyTo = bulkReplyTo.trim();
    if (!trimmedReplyTo || !isValidEmail(trimmedReplyTo)) {
      toast.error('Please enter a valid Reply To email address.');
      return;
    }
    try {
      await sendEmails({
        generated_email_ids: ids,
        reply_to: trimmedReplyTo,
      });
      setShowSendConfirm(false);
      setBulkReplyTo('');
      toast.success(
        'Emails are being sent. You can close this window and monitor status in the outreach table.'
      );
      await handleBulkListRefresh();
    } catch {
      toast.error('Failed to send emails. Please try again.');
    }
  };

  const handleMobileToggleSelect = useCallback((emailId: number, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
  }, []);

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
    return <div className="px-6 py-12 text-center">{emptyMessage}</div>;
  }

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-[2px] mt-[2px]">
          Generated emails ({pagination.total})
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          {allSelected ? (
            <Button variant="outlined" size="sm" onClick={() => setSelectedIds(new Set())}>
              Unselect all
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="sm"
              onClick={handleSelectAll}
              disabled={pageIds.length === 0}
            >
              Select all
            </Button>
          )}
          <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
          <BaseMenu
            align="end"
            disabled={!canBulkActOnDrafts}
            trigger={
              <button
                type="button"
                className={cn(
                  'inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-700 shadow-sm transition-colors',
                  'hover:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2',
                  !canBulkActOnDrafts && 'cursor-not-allowed opacity-50'
                )}
                aria-label="Bulk actions for selected emails"
              >
                {bulkActionsBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <MoreVertical className="h-4 w-4" aria-hidden />
                )}
              </button>
            }
          >
            <BaseMenuItem disabled={!canBulkActOnDrafts} onSelect={() => handleSendClick()}>
              <Send className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              <span>Send emails</span>
            </BaseMenuItem>
            <BaseMenuItem
              disabled={!canBulkActOnDrafts}
              onSelect={() => setShowBulkMarkSentConfirm(true)}
            >
              <Mail className="h-4 w-4 mr-2 shrink-0 text-amber-600" aria-hidden />
              <span>Mark as sent</span>
            </BaseMenuItem>
            <BaseMenuItem
              disabled={!canBulkActOnDrafts}
              className="text-red-600 focus:bg-red-50 focus:text-red-700"
              onSelect={() => setShowBulkDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4 mr-2 shrink-0" aria-hidden />
              <span>Delete</span>
            </BaseMenuItem>
          </BaseMenu>
        </div>
      </div>

      {mdAndUp ? (
        <div className="overflow-x-auto">
          <OutreachTable
            emails={emails}
            onRowClick={handleRowClick}
            getDetailHref={getDetailHref}
            selectedIds={selectedIds}
            onSelectionChange={handleSelectionChange}
          />
        </div>
      ) : (
        <div className="space-y-4">
          {emails.map((email, index) => (
            <OutreachMobileCard
              key={email.id ?? index}
              email={email}
              onClick={() => handleRowClick(email)}
              className="shadow-sm"
              selected={selectedIds.has(email.id)}
              onToggleSelect={handleMobileToggleSelect}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="py-4 flex items-center justify-between">
          <div className="text-sm text-gray-700">
            Page {page} of {totalPages}
            {pagination.total > 0 && (
              <span className="ml-2 text-gray-500">({pagination.total} total)</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <PaginationButton
              label="Previous"
              onClick={() => pushOutreachPage(page - 1)}
              disabled={page <= 1 || isLoading}
              isLoading={isLoading}
            />
            <PaginationButton
              label="Next"
              onClick={() => pushOutreachPage(page + 1)}
              disabled={page >= totalPages || isLoading}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <BulkSendEmailsModal
        isOpen={showSendConfirm}
        onClose={() => setShowSendConfirm(false)}
        isSending={isSending}
        replyTo={bulkReplyTo}
        onReplyToChange={setBulkReplyTo}
        onConfirm={handleSendConfirm}
      />

      <BulkMarkAsSentModal
        isOpen={showBulkMarkSentConfirm}
        onClose={() => setShowBulkMarkSentConfirm(false)}
        draftIds={selectedDraftIdsOnPage}
        onSuccess={handleBulkListRefresh}
      />

      <BulkDeleteOutreachDraftsModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        draftIds={selectedDraftIdsOnPage}
        onSuccess={handleBulkListRefresh}
      />
    </>
  );
}
