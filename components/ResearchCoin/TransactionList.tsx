import { useState, useEffect, useMemo, useCallback } from 'react';
import { TransactionListItem } from './TransactionListItem';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { ExchangeRateService } from '@/services/exchangeRate.service';
import type { TransactionAPIResponse } from '@/services/types/transaction.dto';

interface TransactionListProps {
  transactions: TransactionAPIResponse['results'];
  isLoading: boolean;
  error: string | null;
}

// Batch size for exchange rate fetching
const BATCH_SIZE = 20;
const RATE_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function TransactionList({ transactions, isLoading, error }: TransactionListProps) {
  const [exchangeRates, setExchangeRates] = useState<Map<string, number>>(new Map());
  const [loadingRates, setLoadingRates] = useState<Set<string>>(new Set());
  const [lastFetchTime, setLastFetchTime] = useState<Map<string, number>>(new Map());

  // Memoize transaction dates to prevent unnecessary recalculations
  const transactionDates = useMemo(() => {
    return new Set(
      transactions.map(tx => new Date(tx.created_date).toISOString().split('T')[0])
    );
  }, [transactions]);

  // Helper to check if a rate needs to be refreshed
  const shouldRefreshRate = useCallback((date: string) => {
    const lastFetch = lastFetchTime.get(date);
    if (!lastFetch) return true;
    return Date.now() - lastFetch > RATE_CACHE_DURATION;
  }, [lastFetchTime]);

  // Fetch exchange rates in batches
  useEffect(() => {
    let isMounted = true;

    const unfetchedDates = Array.from(transactionDates).filter(
      date => (!exchangeRates.has(date) || shouldRefreshRate(date)) && !loadingRates.has(date)
    );

    if (unfetchedDates.length === 0) return;

    const fetchBatch = async (dates: string[]) => {
      if (!isMounted) return;
      
      setLoadingRates(prev => new Set([...prev, ...dates]));
      
      try {
        const batchRates = await ExchangeRateService.fetchRatesForDates(dates);
        if (!isMounted) return;
        
        const now = Date.now();
        setExchangeRates(prev => new Map([...prev, ...batchRates]));
        setLastFetchTime(prev => {
          const next = new Map(prev);
          dates.forEach(date => next.set(date, now));
          return next;
        });
      } catch (error) {
        console.error('Error fetching exchange rates:', error);
      } finally {
        if (isMounted) {
          setLoadingRates(prev => {
            const next = new Set(prev);
            dates.forEach(date => next.delete(date));
            return next;
          });
        }
      }
    };

    // Process dates in batches
    for (let i = 0; i < unfetchedDates.length; i += BATCH_SIZE) {
      const batch = unfetchedDates.slice(i, i + BATCH_SIZE);
      fetchBatch(batch);
    }

    return () => {
      isMounted = false;
    };
  }, [transactionDates, exchangeRates, shouldRefreshRate]);

  if (isLoading && !transactions.length) {
    return <TransactionSkeleton />;
  }

  if (error && !transactions.length) {
    return (
      <div className="text-center py-4 text-gray-500">
        {error}
      </div>
    );
  }

  if (!transactions.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No transactions found
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {transactions.map((transaction) => {
        const date = new Date(transaction.created_date).toISOString().split('T')[0];
        return (
          <div 
            key={transaction.id}
            className="first:pt-0 pt-2"
          >
            <TransactionListItem
              transaction={transaction}
              exchangeRate={exchangeRates.get(date)}
              isLoadingRate={loadingRates.has(date)}
            />
          </div>
        );
      })}
    </div>
  );
} 