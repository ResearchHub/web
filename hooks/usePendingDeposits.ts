'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { TransactionService, PendingDeposit } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

const POLL_INTERVAL_MS = 5000;

interface usePendingDepositsReturn {
  deposits: PendingDeposit[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshDeposits: () => Promise<void>;
  hasPendingDepositFeed: boolean;
}

interface UsePendingDepositsOptions {
  onDepositResolved?: () => void;
}

export function usePendingDeposits(options?: UsePendingDepositsOptions): usePendingDepositsReturn {
  const { data: session, status } = useSession();
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track previous pending deposit IDs to detect resolved deposits
  const prevDepositIdsRef = useRef<Set<number>>(new Set());
  const onDepositResolvedRef = useRef(options?.onDepositResolved);
  onDepositResolvedRef.current = options?.onDepositResolved;

  const fetchPendingDeposits = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!session) return;

      try {
        if (!isBackgroundRefresh) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        const response = await TransactionService.getPendingDeposits();
        const pendingDeposits = response.results;

        // Check if any previously-pending deposits have resolved
        const currentIds = new Set(pendingDeposits.map((d) => d.id));
        const prevIds = prevDepositIdsRef.current;

        if (prevIds.size > 0) {
          const resolvedIds = [...prevIds].filter((id) => !currentIds.has(id));
          if (resolvedIds.length > 0) {
            toast.success('Deposit confirmed');
            onDepositResolvedRef.current?.();
          }
        }

        prevDepositIdsRef.current = currentIds;

        // Sort by most recent first
        const sortedDeposits = [...pendingDeposits].sort(
          (a, b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime()
        );

        setDeposits(sortedDeposits);
      } catch (err) {
        console.error('Error fetching pending deposits:', err);
        if (!isBackgroundRefresh) {
          setError('Failed to load pending deposits');
          toast.error('Failed to load pending deposits');
        }
      } finally {
        if (!isBackgroundRefresh) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [session]
  );

  // Initial fetch
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      setIsLoading(false);
      return;
    }

    fetchPendingDeposits();
  }, [session, status, fetchPendingDeposits]);

  // Poll every 5 seconds
  useEffect(() => {
    if (status === 'loading' || !session) return;

    const intervalId = setInterval(() => {
      fetchPendingDeposits(true);
    }, POLL_INTERVAL_MS);

    return () => clearInterval(intervalId);
  }, [session, status, fetchPendingDeposits]);

  const refreshDeposits = useCallback(() => {
    return fetchPendingDeposits(true);
  }, [fetchPendingDeposits]);

  return {
    deposits,
    isLoading,
    isRefreshing,
    error,
    refreshDeposits,
    hasPendingDepositFeed: deposits.length > 0,
  };
}
