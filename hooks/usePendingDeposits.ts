'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransactionService, PendingDeposit } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';

interface usePendingDepositsReturn {
  deposits: PendingDeposit[];
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  refreshDeposits: () => Promise<void>;
  hasPendingDepositFeed: boolean;
}

export function usePendingDeposits(): usePendingDepositsReturn {
  const { data: session, status } = useSession();
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch all pages of deposits
  const fetchAllDeposits = useCallback(async () => {
    if (!session) return [];

    try {
      let allDeposits: PendingDeposit[] = [];
      let nextPageUrl: string | null = null;
      let currentPage = 1;

      do {
        // Get the current page of deposits
        const response = await TransactionService.getDeposits(currentPage);

        // Add the results to our collection
        allDeposits = [...allDeposits, ...response.results];

        // Update pagination info for the next iteration
        nextPageUrl = response.next;
        currentPage++;
      } while (nextPageUrl !== null);

      return allDeposits;
    } catch (err) {
      console.error('Error fetching all deposits:', err);
      throw err;
    }
  }, [session]);

  const fetchPendingDepositFeed = useCallback(
    async (isBackgroundRefresh = false) => {
      if (!session) return;

      try {
        // Only show loading indicator on initial load, not during background refreshes
        if (!isBackgroundRefresh) {
          setIsLoading(true);
        } else {
          setIsRefreshing(true);
        }

        // Fetch all deposits across all pages
        const allDeposits = await fetchAllDeposits();

        // Filter for pending deposits only
        const PendingDepositFeed = allDeposits.filter(
          (deposit) =>
            deposit.paid_status === 'PENDING' ||
            (deposit.amount !== '0' && deposit.paid_status === null)
        );

        // Sort deposits by date in descending order (most recent first)
        const sortedDeposits = [...PendingDepositFeed].sort((a, b) => {
          return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
        });

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
    [session, fetchAllDeposits]
  );

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      setIsLoading(false);
      return;
    }

    fetchPendingDepositFeed();

    // No more polling interval here since it will be handled by the parent
  }, [session, status, fetchPendingDepositFeed]);

  const refreshDeposits = useCallback(() => {
    return fetchPendingDepositFeed(true);
  }, [fetchPendingDepositFeed]);

  return {
    deposits,
    isLoading,
    isRefreshing,
    error,
    refreshDeposits,
    hasPendingDepositFeed: deposits.length > 0,
  };
}
