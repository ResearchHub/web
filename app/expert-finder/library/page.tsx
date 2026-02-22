'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { useExpertSearches } from '@/hooks/useExpertFinder';
import { SearchHistoryTable } from './components/SearchHistoryTable';
import { SearchHistoryTableSkeleton } from './components/SearchHistoryTableSkeleton';
import type { ExpertSearchListItem } from '@/types/expertFinder';

const PAGE_SIZE = 10;

type NavigatingTo = 'prev' | 'next' | null;

export default function ExpertFinderLibraryPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [navigatingTo, setNavigatingTo] = useState<NavigatingTo>(null);
  const offset = (page - 1) * PAGE_SIZE;
  const [{ searches, pagination, isLoading, error }] = useExpertSearches({
    limit: PAGE_SIZE,
    offset,
  });

  useEffect(() => {
    if (!isLoading) setNavigatingTo(null);
  }, [isLoading]);

  const totalPages = Math.max(1, Math.ceil(pagination.total / PAGE_SIZE));
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;

  const handleRowClick = (search: ExpertSearchListItem) => {
    router.push(`/expert-finder/searches/${search.searchId}`);
  };

  let mainContent: React.ReactNode;
  if (isLoading && searches.length === 0) {
    mainContent = (
      <div className="p-4">
        <SearchHistoryTableSkeleton rowCount={PAGE_SIZE} />
      </div>
    );
  } else if (searches.length === 0) {
    mainContent = (
      <div className="px-6 py-12 text-center">
        <p className="text-gray-600 mb-2">No searches yet</p>
        <p className="text-sm text-gray-500">
          Run a search from the Find Expert page to see results here.
        </p>
      </div>
    );
  } else {
    mainContent = (
      <>
        <div className="overflow-x-auto">
          <SearchHistoryTable searches={searches} onRowClick={handleRowClick} />
        </div>

        {totalPages > 1 && (
          <div className="py-4 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {page} of {totalPages}
              {pagination.total > 0 && (
                <span className="ml-2 text-gray-500">({pagination.total} total)</span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outlined"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setNavigatingTo('prev');
                  setPage((p) => Math.max(1, p - 1));
                }}
                disabled={!hasPrevPage || isLoading}
              >
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  {isLoading && navigatingTo === 'prev' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                </span>
                Previous
                <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
              </Button>
              <Button
                variant="outlined"
                size="sm"
                className="gap-2"
                onClick={() => {
                  setNavigatingTo('next');
                  setPage((p) => Math.min(totalPages, p + 1));
                }}
                disabled={!hasNextPage || isLoading}
              >
                <span className="inline-flex h-4 w-4 shrink-0 items-center justify-center">
                  {isLoading && navigatingTo === 'next' ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                  ) : null}
                </span>
                Next
                <span className="inline-block h-4 w-4 shrink-0" aria-hidden />
              </Button>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-8">
      <h2 className="text-2xl font-semibold text-gray-900 mb-2">Library</h2>
      <p className="text-sm text-gray-600 mb-6">View your expert search history.</p>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="overflow-hidden">{mainContent}</div>
    </div>
  );
}
