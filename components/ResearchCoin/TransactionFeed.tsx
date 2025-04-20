import { useState, useEffect, useRef } from 'react';
import { TransactionService } from '@/services/transaction.service';
import { TransactionFeedItem } from './TransactionFeedItem';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import type { TransactionAPIRequest } from '@/services/types/transaction.dto';
import { formatTransaction, type FormattedTransaction } from './lib/types';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { FileDown, LogIn, Coins, HelpCircle, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { ID } from '@/types/root';

const INITIAL_PAGE = 1;
const LOADING_SKELETON_COUNT = 3;

interface TransactionFeedProps {
  onExport: () => void;
  exchangeRate: number;
  isExporting: boolean;
}

export function TransactionFeed({ onExport, exchangeRate, isExporting }: TransactionFeedProps) {
  const { data: session, status } = useSession();
  const [transactions, setTransactions] = useState<TransactionAPIRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true); // For initial load
  const [isLoadingMore, setIsLoadingMore] = useState(false); // For loading more on button click
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
  const [hasNextPage, setHasNextPage] = useState(false);

  const abortController = useRef<AbortController | null>(null);

  // Initial data fetch
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      setIsLoading(false);
      return;
    }

    fetchTransactions(INITIAL_PAGE);
  }, [session, status]);

  async function fetchTransactions(page: number, isLoadingMore = false) {
    if (!session) return;

    if (abortController.current) {
      abortController.current.abort();
    }

    abortController.current = new AbortController();

    try {
      if (isLoadingMore) {
        setIsLoadingMore(true);
      } else {
        setIsLoading(true);
      }

      const response = await TransactionService.getTransactions(page);

      setTransactions((prev) =>
        page === INITIAL_PAGE ? response.results : [...prev, ...response.results]
      );
      setHasNextPage(!!response.next);
      setCurrentPage(page);
      setError(null);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        return;
      }
      console.error('Error fetching transactions:', err);
      setError('Failed to load transactions');
      toast.error('Failed to load transactions');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }

  const handleLoadMore = () => {
    if (!isLoadingMore && hasNextPage) {
      fetchTransactions(currentPage + 1, true);
    }
  };

  // Show initial loading state
  if (isLoading || status === 'loading') {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 
                bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible
                group-hover:opacity-100 group-hover:visible transition-all duration-200
                whitespace-nowrap shadow-lg z-10 w-max max-w-md"
              >
                USD values reflect current exchange rates
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full
                  border-4 border-transparent border-t-gray-900"
                ></div>
              </div>
            </div>
          </div>
          <Button disabled variant="outlined" size="default" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="space-y-4">
          {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
            <TransactionSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  // Show sign-in prompt for logged-out users
  if (status === 'unauthenticated') {
    return (
      <div className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <Button disabled variant="outlined" size="default" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center min-h-[400px] -mt-8">
          <div className="bg-gray-50 rounded-full p-4 mb-6">
            <Coins className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">Welcome to ResearchCoin</h3>
            <p className="text-base text-gray-600 mb-8">
              Sign in to start earning and managing your ResearchCoin. Track your balance, view
              transaction history, and participate in the ResearchHub economy.
            </p>
            <Button
              onClick={() => {
                const signInButton = document.querySelector('[data-testid="sign-in-button"]');
                if (signInButton instanceof HTMLElement) {
                  signInButton.click();
                }
              }}
              variant="default"
              size="lg"
            >
              Sign in to get started
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const userHasNoTransactions = transactions.length === 0 && !isLoading && !error;

  return (
    <div className="bg-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
          <div className="group relative">
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
            <div
              className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 
              bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible
              group-hover:opacity-100 group-hover:visible transition-all duration-200
              whitespace-nowrap shadow-lg z-10 w-max max-w-md"
            >
              USD values reflect current exchange rates
              <div
                className="absolute left-1/2 -translate-x-1/2 top-full
                border-4 border-transparent border-t-gray-900"
              ></div>
            </div>
          </div>
        </div>
        <Button
          onClick={onExport}
          disabled={isLoading || !transactions.length || isExporting}
          variant="outlined"
          size="default"
          className="gap-2"
          title={isExporting ? 'Export in progress...' : undefined}
        >
          <FileDown className="h-4 w-4" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </div>

      {userHasNoTransactions ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] -mt-8">
          <div className="bg-gray-50 rounded-full p-4 mb-6">
            <Coins className="h-8 w-8 text-gray-400" />
          </div>
          <div className="text-center max-w-md">
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Transactions Yet</h3>
            <p className="text-base text-gray-600 mb-8">
              Get started by depositing ResearchCoin or earning RSC by contributing to the
              community.
            </p>
            <Button
              onClick={() => {
                const depositButton = document.querySelector('[data-action="deposit"]');
                if (depositButton instanceof HTMLElement) {
                  depositButton.click();
                }
              }}
              variant="secondary"
              size="lg"
              className="gap-2"
            >
              <Plus className="h-5 w-5" />
              Make Your First Deposit
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="space-y-1">
            {transactions.map((transaction) => (
              <TransactionFeedItem
                key={transaction.id}
                transaction={formatTransaction(transaction, exchangeRate)}
              />
            ))}
          </div>

          {/* Loading more feedback */}
          {isLoadingMore && (
            <div className="space-y-1 animate-fadeIn mt-1">
              {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
                <TransactionSkeleton key={index} />
              ))}
            </div>
          )}

          {/* Load More button - only show if there are transactions and hasNextPage is true */}
          {!isLoading && hasNextPage && transactions.length > 0 && (
            <div className="mt-8 text-center">
              <Button
                onClick={handleLoadMore}
                disabled={isLoadingMore}
                variant="link"
                size="default"
                className="w-full py-3 sm:w-auto sm:py-0 text-indigo-600 hover:text-indigo-500"
              >
                {isLoadingMore ? 'Loading...' : 'Load more'}
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
