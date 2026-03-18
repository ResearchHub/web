import { useState, useEffect, useCallback } from 'react';
import { AutoPaymentService } from '@/services/autoPayment.service';
import type { AutoPayment, AutoPaymentsFilters } from '@/types/autoPayment';

export interface AutoPaymentsState {
  payments: AutoPayment[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export type UseAutoPaymentsReturn = [
  AutoPaymentsState,
  {
    goToNextPage: () => Promise<void>;
    goToPrevPage: () => Promise<void>;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNextPage = currentPage < totalPages;
  const hasPrevPage = currentPage > 1;

  const fetchPayments = useCallback(
    async (page: number) => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await AutoPaymentService.fetchAutoPayments(filters, {
          page,
          pageSize,
        });

        setPayments(response.payments);
        setTotalCount(response.count);
        setCurrentPage(page);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch auto-payments';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    },
    [filters, pageSize]
  );

  const goToNextPage = useCallback(async () => {
    if (hasNextPage) {
      await fetchPayments(currentPage + 1);
    }
  }, [hasNextPage, currentPage, fetchPayments]);

  const goToPrevPage = useCallback(async () => {
    if (hasPrevPage) {
      await fetchPayments(currentPage - 1);
    }
  }, [hasPrevPage, currentPage, fetchPayments]);

  const refetch = useCallback(async () => {
    await fetchPayments(1);
  }, [fetchPayments]);

  useEffect(() => {
    fetchPayments(1);
  }, [fetchPayments]);

  return [
    {
      payments,
      isLoading,
      error,
      currentPage,
      totalPages,
      totalCount,
      hasNextPage,
      hasPrevPage,
    },
    { goToNextPage, goToPrevPage, refetch },
  ];
}
