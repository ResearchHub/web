'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { Modal } from '@/components/ui/form/Modal';
import { useGeneratedEmails, useSendEmails } from '@/hooks/useExpertFinder';
import { useScreenSize } from '@/hooks/useScreenSize';
import { OutreachTable, OUTREACH_TABLE_COLUMNS } from './OutreachTable';
import { OutreachMobileCard } from './OutreachMobileCard';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import { toast } from 'react-hot-toast';
import type { GeneratedEmail } from '@/types/expertFinder';

const DEFAULT_PAGE_SIZE = 10;

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
  /** Used for row click and View link (e.g. /expert-finder/library/{searchId}/outreach/{id}) */
  getDetailHref: (email: GeneratedEmail) => string;
  pageSize?: number;
  /** Custom empty state content when there are no emails */
  emptyMessage?: React.ReactNode;
}

export function GeneratedEmailsList({
  searchId,
  getDetailHref,
  pageSize = DEFAULT_PAGE_SIZE,
  emptyMessage = DEFAULT_EMPTY_MESSAGE,
}: GeneratedEmailsListProps) {
  const router = useRouter();
  const { mdAndUp } = useScreenSize();
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [showSendConfirm, setShowSendConfirm] = useState(false);

  const offset = (page - 1) * pageSize;
  const [{ emails, pagination, isLoading, error }, refetch] = useGeneratedEmails({
    searchId,
    limit: pageSize,
    offset,
  });
  const [{ isLoading: isSending }, sendEmails] = useSendEmails();

  const totalPages = Math.max(1, Math.ceil(pagination.total / pageSize));
  const pageIds = emails.map((e) => e.id);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.has(id));

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

  const handleSendConfirm = async () => {
    const ids = Array.from(selectedIds);
    if (ids.length === 0) return;
    try {
      await sendEmails({ generated_email_ids: ids });
      setShowSendConfirm(false);
      setSelectedIds(new Set());
      toast.success(
        'Emails are being sent. You can close this window and monitor status in the outreach table.'
      );
      refetch();
    } catch {
      // Error already set in hook; toast or show in modal
      toast.error('Failed to send emails. Please try again.');
    }
  };

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
      {mdAndUp && (
        <>
          <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-[2px] mt-[2px]">
              Generated emails ({pagination.total})
            </h2>
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  {allSelected ? (
                    <Button variant="outlined" size="sm" onClick={() => setSelectedIds(new Set())}>
                      Unselect all
                    </Button>
                  ) : (
                    <Button variant="outlined" size="sm" onClick={handleSelectAll}>
                      Select all
                    </Button>
                  )}
                  <span className="text-sm text-gray-600">{selectedIds.size} selected</span>
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-2"
                    onClick={handleSendClick}
                    disabled={isSending}
                  >
                    <Send className="h-4 w-4" aria-hidden />
                    Send emails
                  </Button>
                </>
              )}
            </div>
          </div>
          <div className="overflow-x-auto">
            <OutreachTable
              emails={emails}
              onRowClick={handleRowClick}
              getDetailHref={getDetailHref}
              selectedIds={selectedIds}
              onSelectionChange={handleSelectionChange}
            />
          </div>
        </>
      )}

      {!mdAndUp && (
        <div className="space-y-4">
          {emails.map((email, index) => (
            <OutreachMobileCard
              key={email.id ?? index}
              email={email}
              onClick={() => handleRowClick(email)}
              className="shadow-sm"
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
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              isLoading={isLoading}
            />
            <PaginationButton
              label="Next"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages || isLoading}
              isLoading={isLoading}
            />
          </div>
        </div>
      )}

      <Modal
        isOpen={showSendConfirm}
        onClose={() => !isSending && setShowSendConfirm(false)}
        title="Send emails to experts?"
      >
        <p className="text-sm text-gray-600 mb-4">
          The selected emails will be sent to the experts.
        </p>
        <div className="flex justify-end gap-2">
          <Button
            variant="outlined"
            size="sm"
            onClick={() => setShowSendConfirm(false)}
            disabled={isSending}
          >
            Cancel
          </Button>
          <Button variant="default" size="sm" onClick={handleSendConfirm} disabled={isSending}>
            {isSending ? 'Sending…' : 'Confirm'}
          </Button>
        </div>
      </Modal>
    </>
  );
}
