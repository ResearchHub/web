import { FileDown } from 'lucide-react';
import { TransactionList } from '@/components/ResearchCoin/TransactionList';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { useState, useEffect, useCallback, useRef } from 'react';
import { TransactionService } from '@/services/transaction.service';
import toast from 'react-hot-toast';

export function TransactionsSection({ onExportClick }: { onExportClick: () => void }) {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [hasNextPage, setHasNextPage] = useState<boolean>(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await TransactionService.getTransactions(1);
      setTransactions(response.results);
      setHasNextPage(!!response.next);
      setCurrentPage(1);
    } catch (err) {
      setError('Failed to load transactions');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!hasNextPage || isLoadingMore) return;

    try {
      setIsLoadingMore(true);
      const nextPage = currentPage + 1;
      const response = await TransactionService.getTransactions(nextPage);
      
      if (response.results.length > 0) {
        setTransactions(prev => [...prev, ...response.results]);
        setCurrentPage(nextPage);
        setHasNextPage(!!response.next);
      } else {
        setHasNextPage(false);
      }
    } catch (err) {
      console.error('Error loading more transactions:', err);
      toast.error('Failed to load more transactions');
    } finally {
      setIsLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []); // Fetch on mount

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (entry?.isIntersecting && hasNextPage && !isLoadingMore) {
          fetchNextPage();
        }
      },
      {
        root: null,
        rootMargin: '20px',
        threshold: 1.0,
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isLoadingMore, currentPage]);

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
        
        <button
          onClick={onExportClick}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
            text-gray-600 bg-white border border-gray-200 rounded-md 
            hover:bg-gray-50 hover:border-gray-300 transition-colors"
        >
          <FileDown className="h-4 w-4" />
          Export
        </button>
      </div>

      <TransactionList
        transactions={transactions}
        isLoading={isLoading}
        error={error}
      />

      {hasNextPage && (
        <div ref={observerTarget} className="mt-4">
          {isLoadingMore && (
            <div className="space-y-4">
              <TransactionSkeleton />
              <TransactionSkeleton />
              <TransactionSkeleton />
            </div>
          )}
        </div>
      )}
    </div>
  );
} 