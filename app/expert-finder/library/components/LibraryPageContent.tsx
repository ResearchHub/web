'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Alert } from '@/components/ui/Alert';
import { PaginationButton } from '@/components/ui/PaginationButton';
import { useExpertSearches } from '@/hooks/useExpertFinder';
import { useScreenSize } from '@/hooks/useScreenSize';
import { SearchHistoryTable, SEARCH_HISTORY_COLUMNS } from './SearchHistoryTable';
import { SearchHistoryMobileCard } from './SearchHistoryMobileCard';
import { TableSkeleton } from '@/components/ui/Table/TableSkeleton';
import { ListCardSkeleton } from '@/components/ui/ListCardSkeleton';
import type { ExpertSearchListItem } from '@/types/expertFinder';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';

const PAGE_SIZE = 10;

export function LibraryPageContent() {
  const router = useRouter();
  const { mdAndUp } = useScreenSize();
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;
  const [{ searches, pagination, isLoading, error }] = useExpertSearches({
    limit: PAGE_SIZE,
    offset,
  });

  const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleRowClick = (search: ExpertSearchListItem) => {
    router.push(`/expert-finder/library/${search.searchId}`);
  };

  function renderContent(): React.ReactNode {
    if (isLoading && searches.length === 0) {
      return (
        <div className="p-4">
          {mdAndUp ? (
            <TableSkeleton columns={SEARCH_HISTORY_COLUMNS} rowCount={PAGE_SIZE} />
          ) : (
            <ListCardSkeleton rowCount={PAGE_SIZE} />
          )}
        </div>
      );
    }
    if (searches.length === 0) {
      return (
        <div className="px-6 py-12 text-center flex flex-col items-center justify-center gap-4">
          <p className="text-gray-600">No searches yet</p>
          <p className="text-sm text-gray-500">
            Run a search from the Find Expert page to see results here.
          </p>
          <Link href="/expert-finder/library/new">
            <Button variant="default" size="sm" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Run a search
            </Button>
          </Link>
        </div>
      );
    }

    return (
      <>
        {mdAndUp ? (
          <div className="overflow-x-auto">
            <SearchHistoryTable searches={searches} onRowClick={handleRowClick} />
          </div>
        ) : (
          <div className="space-y-4">
            {searches.map((search, index) => (
              <SearchHistoryMobileCard
                key={search.searchId ?? index}
                search={search}
                onClick={() => handleRowClick(search)}
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
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-2 sm:!text-lg md:!text-2xl">
            Library
          </h2>
          <p className="text-sm text-gray-600">View your expert search history.</p>
        </div>
        {searches.length > 0 && (
          <Link href="/expert-finder/library/new">
            <Button variant="default" size="md" className="gap-2">
              <Plus className="h-4 w-4" aria-hidden />
              Run a new search
            </Button>
          </Link>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="overflow-hidden">{renderContent()}</div>
    </div>
  );
}
