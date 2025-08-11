'use client';

import { useState, useCallback } from 'react';
import { EditorFilters, OrderByOption } from '@/types/editor';
import { useEditorsDashboard } from '@/hooks/useEditorsDashboard';
import { EditorsDashboardNavbar } from './EditorsDashboardNavbar';
import { EditorDashboardCard } from './EditorDashboardCard';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const upDownOptions: OrderByOption[] = [
  {
    value: 'desc',
    label: 'Descending',
  },
  {
    value: 'asc',
    label: 'Ascending',
  },
];

const defaultFilters: EditorFilters = {
  selectedHub: null,
  timeframe: {
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    endDate: new Date(),
  },
  orderBy: upDownOptions[0],
};

export default function EditorsDashboardContent() {
  const [filters, setFilters] = useState<EditorFilters>(defaultFilters);
  const [pageSize, setPageSize] = useState(10);
  const [state, { goToPage, goToNextPage, goToPrevPage, refetch }] = useEditorsDashboard(
    filters,
    pageSize
  );

  const handleFilterChange = useCallback(
    async (newFilters: EditorFilters) => {
      setFilters(newFilters);
      await refetch(newFilters);
    },
    [refetch]
  );

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
  };

  if (state.error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading editors dashboard</p>
          <p className="text-gray-600">{state.error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <EditorsDashboardNavbar
          currentFilters={filters}
          headerLabel="Top Editors"
          onFilterChange={handleFilterChange}
        />

        {/* Page Size Selector */}
        <div className="mb-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Show:</span>
            <select
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm text-gray-600">per page</span>
          </div>
          <div className="text-sm text-gray-600">
            Page {state.currentPage} of {state.totalPages}
          </div>
        </div>

        {/* Header row */}
        <div className="hidden lg:flex items-center bg-white border border-gray-200 rounded-t-lg px-6 py-4 mb-0">
          <div className="flex-1 font-medium text-gray-500">User</div>
          <div className="flex items-center space-x-8">
            <div className="w-24 text-center font-medium text-gray-500">Last Submission</div>
            <div className="w-24 text-center font-medium text-gray-500">Last Comment</div>
            <div className="w-20 text-center font-medium text-gray-500">Submissions</div>
            <div className="w-16 text-center font-medium text-gray-500">Supports</div>
            <div className="w-20 text-center font-medium text-gray-500">Comments</div>
          </div>
        </div>

        {/* Editors list */}
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {state.isLoading ? (
            // Loading skeleton
            <div className="space-y-4 p-6">
              {Array.from({ length: pageSize }).map((_, index) => (
                <div key={index} className="flex items-center space-x-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                  <div className="flex space-x-8">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
              {state.editors.map((editor, index) => (
                <EditorDashboardCard
                  key={`editor-${editor.id}-${index}`}
                  editor={editor}
                  index={index}
                />
              ))}
            </>
          )}
        </div>

        {/* Pagination */}
        {state.totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <div className="flex items-center space-x-2">
              <Button
                variant="outlined"
                onClick={goToPrevPage}
                disabled={!state.hasPrevPage || state.isLoading}
                className="flex items-center space-x-1"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Previous</span>
              </Button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, state.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <Button
                      key={page}
                      variant={state.currentPage === page ? 'default' : 'outlined'}
                      onClick={() => goToPage(page)}
                      disabled={state.isLoading}
                      className="w-8 h-8 p-0"
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outlined"
                onClick={goToNextPage}
                disabled={!state.hasNextPage || state.isLoading}
                className="flex items-center space-x-1"
              >
                <span>Next</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Empty state */}
        {!state.isLoading && state.editors.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No editors found for the selected criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
}
