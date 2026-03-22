'use client';

import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, DollarSign, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useInView } from 'react-intersection-observer';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { Dropdown, DropdownItem } from '@/components/ui/form/Dropdown';
import { DatePicker } from '@/components/ui/form/DatePicker';
import { useScreenSize } from '@/hooks/useScreenSize';
import { useAutoPayments } from '@/hooks/useAutoPayments';
import { formatTimestamp } from '@/utils/date';
import type {
  AutoPayment,
  AutoPaymentsFilters,
  DistributionType,
  DistributedStatus,
} from '@/types/autoPayment';
import { DISTRIBUTION_TYPE_LABELS } from '@/types/autoPayment';

const FILTER_OPTIONS: { value: DistributionType | ''; label: string }[] = [
  { value: '', label: 'All Types' },
  { value: 'EDITOR_PAYOUT', label: 'Editor Pay' },
  { value: 'PREREGISTRATION_UPDATE_REWARD', label: 'Author Update Reward' },
];

const STATUS_STYLES: Record<DistributedStatus, string> = {
  DISTRIBUTED: 'bg-green-100 text-green-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  FAILED: 'bg-red-100 text-red-800',
};

function formatRscAmount(amount: string): string {
  const num = parseFloat(amount);
  if (isNaN(num)) return amount;
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(num);
}

function PaymentCard({ payment }: { payment: AutoPayment }) {
  const recipientName = payment.recipient
    ? `${payment.recipient.firstName} ${payment.recipient.lastName}`
    : null;

  const statusStyle = payment.distributedStatus
    ? STATUS_STYLES[payment.distributedStatus]
    : 'bg-gray-100 text-gray-800';

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-2 min-w-0">
          {payment.recipient && (
            <Avatar
              src={payment.recipient.authorProfile?.profileImage || ''}
              alt={recipientName!}
              size="sm"
              authorId={payment.recipient.authorProfile?.id}
              disableTooltip={true}
              className="flex-shrink-0 mt-0.5"
            />
          )}
          <div className="flex flex-col min-w-0">
            {recipientName ? (
              <Link
                href={`/author/${payment.recipient!.authorProfile?.id || payment.recipient!.id}`}
                className="font-medium text-gray-900 truncate hover:text-blue-600 transition-colors text-sm"
              >
                {recipientName}
              </Link>
            ) : (
              <span className="text-sm text-gray-400">Unknown user</span>
            )}
            <span className="text-sm text-gray-700 mt-1">
              {formatRscAmount(payment.amount)} RSC
            </span>
            <div className="mt-1">
              <Badge variant="primary" size="sm">
                {DISTRIBUTION_TYPE_LABELS[payment.distributionType]}
              </Badge>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-end flex-shrink-0 ml-3">
          <span className="text-xs text-gray-500">{formatTimestamp(payment.createdDate)}</span>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1.5 ${statusStyle}`}
          >
            {payment.distributedStatus || 'Unknown'}
          </span>
        </div>
      </div>
    </div>
  );
}

function PaymentCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 bg-gray-200 rounded-full" />
            <div>
              <Skeleton className="h-4 w-32 mb-1.5" />
              <Skeleton className="h-3.5 w-20 mb-1.5" />
              <Skeleton className="h-5 w-28 rounded-full" />
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Skeleton className="h-3 w-16 mb-1.5" />
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AutoPaymentsContent() {
  const { mdAndUp } = useScreenSize();
  const [distributionType, setDistributionType] = useState<DistributionType | ''>('');
  const [createdAfter, setCreatedAfter] = useState<Date | null>(null);
  const [createdBefore, setCreatedBefore] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const hasActiveFilters = !!(distributionType || createdAfter || createdBefore);

  const filters = useMemo<AutoPaymentsFilters>(
    () => ({
      distributionType: distributionType || undefined,
      createdAfter,
      createdBefore,
    }),
    [distributionType, createdAfter, createdBefore]
  );

  const [state, { loadMore, refetch }] = useAutoPayments(filters);

  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  });

  useEffect(() => {
    if (inView && state.hasMore && !state.isLoading) {
      loadMore();
    }
  }, [inView, state.hasMore, state.isLoading, loadMore]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
    } finally {
      setIsRefreshing(false);
    }
  };

  const clearFilters = () => {
    setDistributionType('');
    setCreatedAfter(null);
    setCreatedBefore(null);
  };

  const selectedFilterLabel = FILTER_OPTIONS.find((o) => o.value === distributionType)?.label;

  return (
    <div className="h-full flex flex-col p-4 pb-20 tablet:!pb-4">
      {/* Header */}
      <div className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Auto-Payments</h1>
            <p className="text-sm text-gray-600 mt-1">
              Audit automated payments including editor pay and author update rewards
            </p>
          </div>

          <Button
            variant="outlined"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center space-x-2"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden tablet:!block">Refresh</span>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 border-b border-gray-200 pb-4 mb-6 tablet:!flex-nowrap flex-wrap">
          <div className="flex items-center gap-3 w-full tablet:!w-auto">
            <Dropdown
              trigger={
                <button className="flex items-center gap-2 px-3 py-1.5 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 whitespace-nowrap">
                  <span>{selectedFilterLabel}</span>
                  <ChevronDown className="w-4 h-4 text-gray-500" />
                </button>
              }
              className="!w-auto whitespace-nowrap"
            >
              {FILTER_OPTIONS.map((option) => (
                <DropdownItem
                  key={option.value}
                  onClick={() => setDistributionType(option.value as DistributionType | '')}
                  className={distributionType === option.value ? 'bg-blue-50 text-blue-700' : ''}
                >
                  {option.label}
                </DropdownItem>
              ))}
            </Dropdown>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap tablet:!hidden ml-auto"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-3 w-full tablet:!w-auto tablet:!ml-auto">
            <div className="flex-1 tablet:!flex-none tablet:!w-36">
              <DatePicker
                value={createdAfter}
                onChange={setCreatedAfter}
                placeholder="From"
                maxDate={createdBefore || undefined}
                withPortal={!mdAndUp}
              />
            </div>

            <div className="flex-1 tablet:!flex-none tablet:!w-36">
              <DatePicker
                value={createdBefore}
                onChange={setCreatedBefore}
                placeholder="To"
                minDate={createdAfter || undefined}
                withPortal={!mdAndUp}
              />
            </div>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800 whitespace-nowrap hidden tablet:!block"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        <div className="max-w-4xl mx-auto">
          {state.error && (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="text-red-500 text-lg mb-4">Error: {state.error}</div>
              <Button variant="outlined" size="sm" onClick={() => refetch()}>
                Retry
              </Button>
            </div>
          )}

          {state.isLoading && state.payments.length === 0 && (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <PaymentCardSkeleton key={i} />
              ))}
            </div>
          )}

          {state.payments.length === 0 && !state.isLoading && !state.error && (
            <div className="text-center py-12">
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <DollarSign className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-600 text-center max-w-md">
                  No automated payments match the current filters. Try adjusting your date range or
                  payment type.
                </p>
              </div>
            </div>
          )}

          {state.payments.length > 0 && (
            <div className="space-y-4">
              {state.payments.map((payment) => (
                <PaymentCard key={payment.id} payment={payment} />
              ))}
            </div>
          )}

          {state.isLoading && state.payments.length > 0 && (
            <div className="space-y-4 mt-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <PaymentCardSkeleton key={i} />
              ))}
            </div>
          )}

          {!state.isLoading && state.hasMore && <div ref={loadMoreRef} className="h-10" />}
        </div>
      </div>
    </div>
  );
}
