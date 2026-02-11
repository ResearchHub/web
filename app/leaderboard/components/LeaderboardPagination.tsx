'use client';

interface LeaderboardPaginationProps {
  currentPage: number;
  totalPages: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
  isLoading: boolean;
  onPrevPage: () => void;
  onNextPage: () => void;
}

export function LeaderboardPagination({
  currentPage,
  totalPages,
  hasPrevPage,
  hasNextPage,
  isLoading,
  onPrevPage,
  onNextPage,
}: LeaderboardPaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <div className="mt-4 px-0 py-4 border-t border-gray-200 flex items-center justify-between">
      <div className="text-sm text-gray-700">
        Page {currentPage} of {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPrevPage}
          disabled={!hasPrevPage || isLoading}
          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Previous
        </button>
        <button
          type="button"
          onClick={onNextPage}
          disabled={!hasNextPage || isLoading}
          className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
