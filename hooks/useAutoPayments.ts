import { useState, useEffect, useCallback } from 'react';
import { AutoPaymentService } from '@/services/autoPayment.service';
import type { AutoPayment, AutoPaymentsFilters } from '@/types/autoPayment';

export interface AutoPaymentsState {
  payments: AutoPayment[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
}

export type UseAutoPaymentsReturn = [
  AutoPaymentsState,
  {
    loadMore: () => Promise<void>;
    refetch: () => Promise<void>;
  },
];

export function useAutoPayments(
  filters: AutoPaymentsFilters,
  pageSize: number = 20
): UseAutoPaymentsReturn {
  const [payments, setPayments] = useState<AutoPayment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const fetchPayments = useCallback(
    async (targetPage: number, append: boolean) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await AutoPaymentService.fetchAutoPayments(filters, {
          page: targetPage,
          pageSize,
        });

        setPayments((prev) => (append ? [...prev, ...response.payments] : response.payments));
        setHasMore(response.count > targetPage * pageSize);
        setPage(targetPage);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch auto-payments';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pageSize]
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoading) return;
    await fetchPayments(page + 1, true);
  }, [hasMore, isLoading, page, fetchPayments]);

  const refetch = useCallback(async () => {
    setPayments([]);
    setPage(1);
    setHasMore(false);
    await fetchPayments(1, false);
  }, [fetchPayments]);

  useEffect(() => {
    setPayments([]);
    setPage(1);
    setHasMore(false);
    fetchPayments(1, false);
  }, [fetchPayments]);

  return [
    { payments, isLoading, error, hasMore },
    { loadMore, refetch },
  ];
}
