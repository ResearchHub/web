'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { useGeneratedEmails } from '@/hooks/useExpertFinder';
import { useScreenSize } from '@/hooks/useScreenSize';
import { OutreachTable, OUTREACH_TABLE_COLUMNS } from './OutreachTable';
import { OutreachMobileCard } from './OutreachMobileCard';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import type { GeneratedEmail } from '@/types/expertFinder';

const PAGE_SIZE = 10;

export function OutreachPageContent() {
  const router = useRouter();
  const { mdAndUp } = useScreenSize();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const [{ emails, pagination, isLoading, error }] = useGeneratedEmails({
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleRowClick = (email: GeneratedEmail) => {
    router.push(`/expert-finder/outreach/${email.id}`);
  };

  function renderContent(): React.ReactNode {
    if (isLoading && emails.length === 0) {
      return (
        <div className="p-4">
          {mdAndUp ? (
            <TableSkeleton columns={OUTREACH_TABLE_COLUMNS} rowCount={PAGE_SIZE} />
          ) : (
            <ListCardSkeleton rowCount={PAGE_SIZE} />
          )}
        </div>
      );
    }
    if (emails.length === 0) {
      return (
        <div className="px-6 py-12 text-center">
          <p className="text-gray-600 mb-2">No generated emails yet</p>
          <p className="text-sm text-gray-500">
            Generate outreach emails from a search result (Library → open a search → select experts
            → Generate emails).
          </p>
        </div>
      );
    }

    return (
      <>
        {mdAndUp ? (
          <div className="overflow-x-auto">
            <OutreachTable emails={emails} onRowClick={handleRowClick} />
          </div>
        ) : (
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
                disabled={!hasPrevPage || isLoading}
                isLoading={isLoading}
              />
              <PaginationButton
                label="Next"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={!hasNextPage || isLoading}
                isLoading={isLoading}
              />
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-base font-semibold text-gray-900 mb-2 sm:!text-lg md:!text-2xl">
        Outreach
      </h2>
      <p className="text-sm text-gray-600 mb-6">View and manage your generated outreach emails.</p>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="overflow-hidden">{renderContent()}</div>
    </div>
  );
}
