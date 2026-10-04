'use client';

import { useState, useCallback, useEffect, useMemo, type MouseEvent } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  EXPERT_FINDER_LIST_PAGE_SIZE,
  EXPERT_FINDER_OUTREACH_PAGE_SIZE,
  PAGE_QUERY,
  parsePageQueryParam,
} from '@/app/expert-finder/lib/paginationParams';
import { TAB_OUTREACH } from '@/app/expert-finder/lib/searchDetailTabs';
import { Eye, Loader2, Mail, Send, Trash2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { ConfirmationModal } from '@/components/ui/form/ConfirmationModal';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { ExpertFinderService } from '@/services/expertFinder.service';
import {
  useGeneratedEmails,
  useMailboxStatus,
  usePreviewEmails,
  useSendEmails,
} from '@/hooks/useExpertFinder';
import { useOutreachReplyTo } from '@/hooks/useOutreachReplyTo';
import { useScreenSize } from '@/hooks/useScreenSize';
import { OutreachTable, OUTREACH_TABLE_COLUMNS } from './OutreachTable';
import { OutreachMobileCard } from './OutreachMobileCard';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import { SendConfirmationModal } from '@/app/expert-finder/components/SendConfirmationModal';
import {
  getOutreachSendErrorMessage,
  isGmailConnectRequiredError,
} from '@/app/expert-finder/lib/outreachSendErrors';
import { parseAndValidateReplyToInput } from '@/app/expert-finder/lib/parseReplyToAddresses';
import { toast } from 'react-hot-toast';
import type { GeneratedEmail } from '@/types/expertFinder';
import { isGeneratedEmailDraftLike } from '@/app/expert-finder/lib/generatedEmailStatus';

const DEFAULT_EMPTY_MESSAGE = (
  <>
    <p className="text-gray-600 mb-2">No outreach yet</p>
    <p className="text-sm text-gray-500">
      Generate outreach from a search result (Library → open a search → select experts → Generate
      outreach).
    </p>
  </>
);

type SendModalMode = 'send' | 'preview' | null;

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
  const { mdAndUp } = useScreenSize();
  const pageSize = EXPERT_FINDER_OUTREACH_PAGE_SIZE;

  const pageFromUrl = useMemo(
    () => parsePageQueryParam(searchParams.get(PAGE_QUERY)),
    [searchParams]
  );

  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);
  const [bulkDeleteBusy, setBulkDeleteBusy] = useState(false);
  const [sendModalMode, setSendModalMode] = useState<SendModalMode>(null);

  const [{ status: mailboxStatus, isLoading: isMailboxLoading }] = useMailboxStatus();
  const [{ isLoading: isSending }, sendEmails] = useSendEmails();
  const [{ isLoading: isPreviewing }, previewEmails] = usePreviewEmails();
  const { replyTo, setReplyTo } = useOutreachReplyTo();

  const offset = (pageFromUrl - 1) * pageSize;
  const [{ emails, pagination, isLoading, error }, refetch] = useGeneratedEmails({
    searchId,
    limit: pageSize,
    offset,
  });

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

  const selectedSendableDraftIds = useMemo(
    () =>
      emails
        .filter(
          (e) =>
            selectedIds.has(e.id) &&
            isGeneratedEmailDraftLike(e.status) &&
            Boolean(e.expertEmail?.trim())
        )
        .map((e) => e.id),
    [emails, selectedIds]
  );

  const mailboxReady =
    mailboxStatus?.connected === true && mailboxStatus.status !== 'needs_reauth';
  const mailboxNeedsReauth = mailboxStatus?.status === 'needs_reauth';
  const remainingToday = mailboxStatus?.remainingToday;

  const isSendBusy = isSending || isPreviewing;
  const canBulkDeleteDrafts = selectedDraftIdsOnPage.length > 0 && !bulkDeleteBusy && !isSendBusy;
  const canBulkSend =
    mailboxReady && selectedSendableDraftIds.length > 0 && !isSendBusy && !bulkDeleteBusy;

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

  useEffect(() => {
    if (!showBulkDeleteConfirm) setBulkDeleteBusy(false);
  }, [showBulkDeleteConfirm]);

  const handleBulkListRefresh = useCallback(async () => {
    setSelectedIds(new Set());
    await refetch();
  }, [refetch]);

  const handleMobileToggleSelect = useCallback((emailId: number, e: MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(emailId)) next.delete(emailId);
      else next.add(emailId);
      return next;
    });
  }, []);

  const handleBulkDeleteConfirm = useCallback(async () => {
    const ids = selectedDraftIdsOnPage;
    if (ids.length === 0) return;
    setBulkDeleteBusy(true);
    try {
      const results = await Promise.allSettled(
        ids.map((id) => ExpertFinderService.deleteEmail(id))
      );
      const ok = results.filter((r) => r.status === 'fulfilled').length;
      const bad = results.length - ok;
      if (bad === 0) {
        toast.success(`Deleted ${ok} draft(s).`);
      } else {
        toast.error(`Deleted ${ok}; ${bad} failed.`);
      }
      await handleBulkListRefresh();
      setShowBulkDeleteConfirm(false);
    } catch {
      toast.error('Failed to delete drafts.');
    } finally {
      setBulkDeleteBusy(false);
    }
  }, [selectedDraftIdsOnPage, handleBulkListRefresh]);

  const handleBulkSendConfirm = useCallback(async () => {
    if (!sendModalMode || selectedSendableDraftIds.length === 0) return;
    const replyValidation = parseAndValidateReplyToInput(replyTo);
    if (!replyValidation.valid) {
      toast.error(replyValidation.error);
      return;
    }

    try {
      const payload = {
        generated_email_ids: selectedSendableDraftIds,
        reply_to: replyValidation.emails,
      };
      if (sendModalMode === 'preview') {
        const result = await previewEmails(payload);
        toast.success(
          result.sent > 0 ? `Preview sent (${result.sent})` : 'Preview sent to your inbox'
        );
      } else {
        const result = await sendEmails(payload);
        toast.success(
          result.sent > 0
            ? `Queued ${result.sent} outreach email(s)`
            : `Queued ${selectedSendableDraftIds.length} outreach email(s)`
        );
        await handleBulkListRefresh();
      }
      setSendModalMode(null);
    } catch (e) {
      const message = getOutreachSendErrorMessage(
        e,
        sendModalMode === 'preview' ? 'Failed to send preview email' : 'Failed to send emails'
      );
      toast.error(message);
      if (isGmailConnectRequiredError(e)) {
        setSendModalMode(null);
        router.push('/expert-finder/settings');
      }
    }
  }, [
    sendModalMode,
    selectedSendableDraftIds,
    replyTo,
    previewEmails,
    sendEmails,
    handleBulkListRefresh,
    router,
  ]);

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
          <TableSkeleton columns={OUTREACH_TABLE_COLUMNS} rowCount={EXPERT_FINDER_LIST_PAGE_SIZE} />
        ) : (
          <ListCardSkeleton rowCount={EXPERT_FINDER_LIST_PAGE_SIZE} />
        )}
      </div>
    );
  }

  if (emails.length === 0) {
    return <div className="px-6 py-12 text-center">{emptyMessage}</div>;
  }

  const showBulkActions = selectedIds.size > 0;
  const showConnectNudge =
    showBulkActions && selectedSendableDraftIds.length > 0 && !mailboxReady && !isMailboxLoading;

  return (
    <>
      <div className="mb-4 space-y-2">
        <h2 className="text-lg font-semibold text-gray-900 mb-[2px] mt-[2px]">
          Generated outreach ({pagination.total})
        </h2>
        <div className="flex flex-wrap items-center justify-between gap-2">
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
            {showBulkActions && selectedDraftIdsOnPage.length > 0 && (
              <span className="text-sm text-gray-500">
                ({selectedSendableDraftIds.length} draft
                {selectedSendableDraftIds.length === 1 ? '' : 's'} sendable)
              </span>
            )}
          </div>
          {showBulkActions ? (
            <div className="flex flex-wrap items-center gap-2">
              {mailboxReady ? (
                <>
                  <Button
                    variant="outlined"
                    size="sm"
                    className="gap-2"
                    disabled={!canBulkSend}
                    onClick={() => setSendModalMode('preview')}
                  >
                    {isPreviewing ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden />
                    )}
                    Send preview
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    disabled={!canBulkSend}
                    title={
                      mailboxStatus?.email
                        ? `Send from ${mailboxStatus.email}`
                        : 'Send via connected Gmail'
                    }
                    onClick={() => setSendModalMode('send')}
                  >
                    {isSending ? (
                      <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                    ) : (
                      <Send className="h-4 w-4" aria-hidden />
                    )}
                    Send
                  </Button>
                </>
              ) : showConnectNudge ? (
                <Button
                  variant="default"
                  size="sm"
                  className="gap-2"
                  disabled={isMailboxLoading}
                  onClick={() => router.push('/expert-finder/settings')}
                >
                  <Mail className="h-4 w-4" aria-hidden />
                  {mailboxNeedsReauth ? 'Reconnect Gmail' : 'Connect Gmail'}
                </Button>
              ) : null}
              <Button
                variant="destructive"
                size="sm"
                className="gap-2"
                disabled={!canBulkDeleteDrafts}
                onClick={() => setShowBulkDeleteConfirm(true)}
              >
                {bulkDeleteBusy ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                ) : (
                  <Trash2 className="h-4 w-4" aria-hidden />
                )}
                Delete
              </Button>
            </div>
          ) : null}
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

      <SendConfirmationModal
        isOpen={sendModalMode != null}
        onClose={() => !isSendBusy && setSendModalMode(null)}
        isSubmitting={isSendBusy}
        title={
          sendModalMode === 'preview'
            ? `Send preview for ${selectedSendableDraftIds.length} draft(s)?`
            : `Send ${selectedSendableDraftIds.length} outreach email(s)?`
        }
        description={
          sendModalMode === 'preview' ? (
            <p>
              We&apos;ll send copies to your inbox so you can review formatting before contacting
              experts.
              {mailboxStatus?.email ? (
                <>
                  {' '}
                  From: <span className="font-medium text-gray-900">{mailboxStatus.email}</span>.
                </>
              ) : null}
            </p>
          ) : (
            <p>
              This queues send from your connected Gmail
              {mailboxStatus?.email ? (
                <>
                  {' '}
                  (<span className="font-medium text-gray-900">{mailboxStatus.email}</span>)
                </>
              ) : null}
              . Experts who reply will use the Reply To addresses below.
              {typeof remainingToday === 'number' ? (
                <>
                  {' '}
                  You have <span className="font-medium text-gray-900">{remainingToday}</span> send
                  {remainingToday === 1 ? '' : 's'} left today.
                </>
              ) : null}
            </p>
          )
        }
        replyTo={replyTo}
        onReplyToChange={setReplyTo}
        onConfirm={() => void handleBulkSendConfirm()}
        confirmLabel={
          sendModalMode === 'preview' ? 'Send preview' : `Send ${selectedSendableDraftIds.length}`
        }
        submittingLabel={sendModalMode === 'preview' ? 'Sending preview…' : 'Sending…'}
        confirmIcon={
          sendModalMode === 'preview' ? (
            <Eye className="h-4 w-4" aria-hidden />
          ) : (
            <Send className="h-4 w-4" aria-hidden />
          )
        }
      />

      <ConfirmationModal
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        title="Delete selected drafts?"
        description={`Permanently delete ${selectedDraftIdsOnPage.length} draft(s)? This cannot be undone.`}
        confirmLabel="Delete"
        confirmVariant="destructive"
        confirmIcon={<Trash2 className="h-4 w-4" aria-hidden />}
        isConfirming={bulkDeleteBusy}
        onConfirm={handleBulkDeleteConfirm}
      />
    </>
  );
}
