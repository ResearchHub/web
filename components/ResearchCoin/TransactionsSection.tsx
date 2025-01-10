import { FileDown, LogIn, Coins, HelpCircle } from 'lucide-react';
import { TransactionList } from '@/components/ResearchCoin/TransactionList';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { TransactionService } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import toast from 'react-hot-toast';
import type { TransactionAPIResponse } from '@/services/types/transaction.dto';

// Constants for better maintainability
const INITIAL_PAGE = 1;
const OBSERVER_THRESHOLD = 0.5;
const OBSERVER_ROOT_MARGIN = '100px';
const STORAGE_KEY = 'researchhub_transactions_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes
const ERROR_MESSAGES = {
  FETCH_FAILED: 'Failed to load transactions',
  LOAD_MORE_FAILED: 'Failed to load more transactions'
} as const;

interface TransactionCache {
  transactions: TransactionAPIResponse['results'];
  timestamp: number;
  currentPage: number;
  hasNextPage: boolean;
}

interface TransactionsSectionProps {
  onExportClick: () => void;
  initialTransactions: TransactionAPIResponse['results'];
  isInitialLoading: boolean;
  exchangeRate: number;
}

export function TransactionsSection({ 
  onExportClick, 
  initialTransactions,
  isInitialLoading,
  exchangeRate
}: TransactionsSectionProps) {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<TransactionAPIResponse['results']>(initialTransactions);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
  const [hasNextPage, setHasNextPage] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  
  // Refs for better performance and cleanup
  const observerRef = useRef<IntersectionObserver | null>(null);
  const observerTarget = useRef<HTMLDivElement>(null);
  const abortController = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update transactions when initialTransactions change
  useEffect(() => {
    setTransactions(initialTransactions);
  }, [initialTransactions]);

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchMoreTransactions = useCallback(async (page: number) => {
    if (!session) return;

    // Clean up previous request if exists
    if (abortController.current) {
      abortController.current.abort();
    }
    
    abortController.current = new AbortController();
    
    try {
      setIsLoadingMore(true);
      const response = await TransactionService.getTransactions(page);
      
      if (!response?.results) {
        throw new Error('Invalid response format');
      }

      setTransactions(prev => [...prev, ...response.results]);
      setHasNextPage(!!response.next);
      setCurrentPage(page);
      setError(null);
      setIsRetrying(false);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Ignore abort errors
      }
      console.error('Error fetching more transactions:', err);
      toast.error(ERROR_MESSAGES.LOAD_MORE_FAILED);
      
      // Auto-retry once after 3 seconds
      if (!isRetrying) {
        setIsRetrying(true);
        retryTimeoutRef.current = setTimeout(() => {
          fetchMoreTransactions(page);
        }, 3000);
      }
    } finally {
      setIsLoadingMore(false);
    }
  }, [isRetrying, session]);

  // Intersection Observer setup
  useEffect(() => {
    if (!session) return;

    const handleIntersection = (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry?.isIntersecting && hasNextPage && !isLoadingMore && !isInitialLoading && !isRetrying) {
        fetchMoreTransactions(currentPage + 1);
      }
    };

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(handleIntersection, {
      root: null,
      rootMargin: OBSERVER_ROOT_MARGIN,
      threshold: OBSERVER_THRESHOLD,
    });

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observerRef.current.observe(currentTarget);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasNextPage, isLoadingMore, isInitialLoading, currentPage, fetchMoreTransactions, isRetrying, session]);

  // Show loading state
  if (isInitialLoading || status === 'loading') {
    return (
      <div className="bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <button disabled className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
            text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="space-y-4">
          <TransactionSkeleton />
          <TransactionSkeleton />
          <TransactionSkeleton />
        </div>
      </div>
    );
  }

  // Show sign-in prompt for logged-out users ONLY after session is loaded
  if (status === 'unauthenticated') {
    return (
      <div className="bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <button disabled className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
            text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] -mt-8">
          <div className="bg-gray-50 rounded-full p-4 mb-6">
            <Coins className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              Welcome to ResearchCoin
            </h3>
            <p className="text-base text-gray-600 mb-8">
              Sign in to start earning and managing your ResearchCoin.
              Track your balance, view transaction history, and participate in
              the ResearchHub economy.
            </p>
            <button
              onClick={() => {
                // This will trigger the auth modal in the TopBar
                const signInButton = document.querySelector('[data-testid="sign-in-button"]');
                if (signInButton instanceof HTMLElement) {
                  signInButton.click();
                }
              }}
              className="inline-flex items-center px-6 py-2.5 
                text-base font-medium rounded-lg text-white bg-[#4F46E5] 
                hover:bg-[#4338CA] focus:outline-none focus:ring-2 
                focus:ring-offset-2 focus:ring-[#4F46E5] transition-colors"
            >
              Sign In to Get Started
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render error state with retry button
  if (error && !transactions.length) {
    return (
      <div className="bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <button disabled className="flex items-center gap-2 px-4 py-2 text-sm font-medium 
            text-gray-400 bg-gray-50 border border-gray-200 rounded-md cursor-not-allowed">
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500 mb-4">{error}</p>
          <button
            onClick={() => fetchMoreTransactions(INITIAL_PAGE)}
            className="px-4 py-2 text-sm font-medium text-primary-400 border border-primary-200 
              rounded-md hover:bg-primary-50 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 
              bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible
              group-hover:opacity-100 group-hover:visible transition-all duration-200
              whitespace-nowrap shadow-lg z-10 w-max max-w-md">
              USD values shown reflect current exchange rates estimates
              <div className="absolute left-1/2 -translate-x-1/2 top-full
                border-4 border-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>
        <button
          onClick={onExportClick}
          disabled={isInitialLoading || !transactions.length}
          className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md 
            transition-colors ${isInitialLoading || !transactions.length
              ? 'text-gray-400 bg-gray-50 border border-gray-200 cursor-not-allowed'
              : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
            }`}
        >
          <FileDown className="h-4 w-4" />
          Export
        </button>
      </div>

      <TransactionList
        transactions={transactions}
        exchangeRate={exchangeRate}
        isLoading={false}
        error={error}
      />

      {/* Infinite scroll trigger */}
      {hasNextPage && (
        <div 
          ref={observerTarget} 
          className="h-4 mt-4"
          aria-hidden="true"
        >
          {isLoadingMore && (
            <div className="space-y-4">
              <TransactionSkeleton />
              <TransactionSkeleton />
            </div>
          )}
        </div>
      )}

      {/* Show retry button if load more failed */}
      {error && transactions.length > 0 && (
        <div className="text-center py-4">
          <button
            onClick={() => fetchMoreTransactions(currentPage + 1)}
            className="px-4 py-2 text-sm font-medium text-primary-400 border border-primary-200 
              rounded-md hover:bg-primary-50 transition-colors"
          >
            Retry Loading More
          </button>
        </div>
      )}
    </div>
  );
} 