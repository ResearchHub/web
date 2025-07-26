'use client';

import { TableContainer, SortableColumn, MobileTableCard } from '@/components/ui/Table';
import { Avatar } from '@/components/ui/Avatar';
import { ModNetworkDetail } from '@/types/referral';
import { formatTimestamp } from '@/utils/date';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useModReferralNetworkDetails } from '@/hooks/useReferral';
import { ReferralTableSkeleton } from '@/components/skeletons/ReferralTableSkeleton';

export default function ReferralDashboardContent() {
  const { mdAndUp } = useScreenSize();
  const {
    networkDetails: data,
    isLoading,
    error,
    currentPage,
    totalPages,
    hasNextPage,
    hasPrevPage,
    goToPage,
    goToNextPage,
    goToPrevPage,
    refetch,
  } = useModReferralNetworkDetails(10);

  const columns: SortableColumn[] = [
    { key: 'referrerUser', label: 'Referrer', sortable: false },
    { key: 'fullName', label: 'Referred User', sortable: false },
    { key: 'signupDate', label: 'Signup Date', sortable: false },
    { key: 'totalFunded', label: 'Total Funded', sortable: false },
    { key: 'referralBonusEarned', label: 'Credits Earned', sortable: false },
    { key: 'isReferralBonusExpired', label: 'Status', sortable: false },
  ];

  // Remove the handleSort function since sorting is not available

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderCellContent = (row: ModNetworkDetail, column: SortableColumn) => {
    switch (column.key) {
      case 'referrerUser':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={row.referrerUser?.profileImage || ''}
              alt={row.referrerUser?.fullName || 'Unknown User'}
              size="sm"
              className="flex-shrink-0"
            />
            <span className="font-medium text-gray-900 truncate">
              {row.referrerUser?.fullName || 'Unknown User'}
            </span>
          </div>
        );

      case 'fullName':
        return (
          <div className="flex items-center gap-2 min-w-0">
            <Avatar
              src={row.profileImage || ''}
              alt={row.fullName || 'Unknown User'}
              size="sm"
              className="flex-shrink-0"
            />
            <span className="font-medium text-gray-900 truncate">
              {row.fullName || 'Unknown User'}
            </span>
          </div>
        );

      case 'signupDate':
        return <span className="text-gray-600">{formatTimestamp(row.signupDate)}</span>;

      case 'totalFunded':
        return <span className="font-medium text-gray-900">{formatCurrency(row.totalFunded)}</span>;

      case 'referralBonusEarned':
        return (
          <span className="font-medium text-green-600">
            {formatCurrency(row.referralBonusEarned)}
          </span>
        );

      case 'isReferralBonusExpired':
        return (
          <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              row.isReferralBonusExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
            }`}
          >
            {row.isReferralBonusExpired ? 'Expired' : 'Active'}
          </span>
        );

      default:
        return row[column.key as keyof ModNetworkDetail];
    }
  };

  // Prepare data for mobile cards
  const mobileColumns = [
    { key: 'referrerUser', label: 'Referrer' },
    { key: 'fullName', label: 'Referred User' },
    { key: 'signupDate', label: 'Signup Date' },
    { key: 'totalFunded', label: 'Total Funded' },
    { key: 'referralBonusEarned', label: 'Credits Earned' },
    { key: 'isReferralBonusExpired', label: 'Status' },
  ];

  const mobileData = data.map((row) => ({
    referrerUser: (
      <div className="flex items-center gap-2">
        <Avatar
          src={row.referrerUser?.profileImage || ''}
          alt={row.referrerUser?.fullName || 'Unknown User'}
          size="xs"
        />
        <span className="font-medium text-gray-900 truncate">
          {row.referrerUser?.fullName || 'Unknown User'}
        </span>
      </div>
    ),
    fullName: (
      <div className="flex items-center gap-2">
        <Avatar src={row.profileImage || ''} alt={row.fullName || 'Unknown User'} size="xs" />
        <span className="font-medium text-gray-900 truncate">{row.fullName || 'Unknown User'}</span>
      </div>
    ),
    signupDate: formatTimestamp(row.signupDate),
    totalFunded: formatCurrency(row.totalFunded),
    referralBonusEarned: formatCurrency(row.referralBonusEarned),
    isReferralBonusExpired: (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
          row.isReferralBonusExpired ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}
      >
        {row.isReferralBonusExpired ? 'Expired' : 'Active'}
      </span>
    ),
  }));

  if (error) {
    return (
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-semibold text-gray-900">Referral Network</h1>
                <p className="text-sm text-gray-600 mt-1">
                  Track users who have been referred and their funding activity
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main content area */}
        <div className="flex-1 overflow-auto">
          <div className="p-6 text-center">
            <div className="text-red-500 text-lg">Error: {error}</div>
            <button
              onClick={refetch}
              className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Referral Network</h1>
              <p className="text-sm text-gray-600 mt-1">
                Track users who have been referred and their funding activity
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content area with table */}
      <div className="flex-1 overflow-auto">
        {/* Desktop Table View */}
        {mdAndUp && (
          <div className="w-full overflow-x-auto max-w-full mx-auto p-6">
            {isLoading ? (
              <ReferralTableSkeleton columns={columns} rowCount={10} />
            ) : (
              <TableContainer
                columns={columns}
                data={data.map((row) => ({
                  ...row,
                  referrerUser: renderCellContent(row, { key: 'referrerUser', label: 'Referrer' }),
                  fullName: renderCellContent(row, { key: 'fullName', label: 'Referred User' }),
                  signupDate: renderCellContent(row, { key: 'signupDate', label: 'Signup Date' }),
                  totalFunded: renderCellContent(row, {
                    key: 'totalFunded',
                    label: 'Total Funded',
                  }),
                  referralBonusEarned: renderCellContent(row, {
                    key: 'referralBonusEarned',
                    label: 'Credits Earned',
                  }),
                  isReferralBonusExpired: renderCellContent(row, {
                    key: 'isReferralBonusExpired',
                    label: 'Status',
                  }),
                }))}
                className="w-full"
              />
            )}
          </div>
        )}

        {/* Mobile Card View */}
        {!mdAndUp && (
          <div className="p-4 space-y-4">
            {isLoading
              ? // Mobile skeleton
                Array.from({ length: 10 }).map((_, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 bg-gray-200 rounded-full" />
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-32 mb-1" />
                        <div className="h-3 bg-gray-200 rounded w-24" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-200 rounded w-20" />
                      <div className="h-3 bg-gray-200 rounded w-16" />
                      <div className="h-3 bg-gray-200 rounded w-24" />
                    </div>
                  </div>
                ))
              : mobileData.map((row, index) => (
                  <MobileTableCard
                    key={data[index]?.authorId || index}
                    data={row}
                    columns={mobileColumns}
                    onClick={() => console.log('Card clicked:', data[index])}
                    className="shadow-sm"
                  />
                ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={goToPrevPage}
                disabled={!hasPrevPage || isLoading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={goToNextPage}
                disabled={!hasNextPage || isLoading}
                className="px-3 py-1 text-sm border border-gray-300 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
