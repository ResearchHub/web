import { useState, useEffect, useRef, forwardRef, useImperativeHandle, useCallback } from 'react';
import { useInView } from 'react-intersection-observer';
import { TransactionService } from '@/services/transaction.service';
import { FundraiseService } from '@/services/fundraise.service';
import { TransactionFeedItem } from './TransactionFeedItem';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { formatTransaction, formatUsdContribution, type FormattedTransaction } from './lib/types';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/Button';
import { PillTabs } from '@/components/ui/PillTabs';
import { BaseMenu, BaseMenuItem } from '@/components/ui/form/BaseMenu';
import { FileDown, Coins, MoreVertical, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const INITIAL_PAGE = 1;
const LOADING_SKELETON_COUNT = 3;

type FeedCurrency = 'RSC' | 'USD';

interface TransactionFeedProps {
  onExport: () => void;
  exchangeRate: number;
  showUSD?: boolean;
  isExporting: boolean;
}

export type TransactionFeedHandle = {
  refresh: () => Promise<void>;
};

export const TransactionFeed = forwardRef<TransactionFeedHandle, TransactionFeedProps>(
  function TransactionFeed({ onExport, exchangeRate, showUSD = false, isExporting }, ref) {
    const { data: session, status } = useSession();
    const [feedCurrency, setFeedCurrency] = useState<FeedCurrency>('RSC');
    const [transactions, setTransactions] = useState<FormattedTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(INITIAL_PAGE);
    const [hasNextPage, setHasNextPage] = useState(false);

    const abortController = useRef<AbortController | null>(null);

    const { ref: loadMoreRef, inView } = useInView({
      threshold: 0,
      rootMargin: '200px',
    });

    const fetchTransactions = useCallback(
      async (page: number, opts: { append?: boolean; currency?: FeedCurrency } = {}) => {
        if (!session) return;
        const { append = false, currency = feedCurrency } = opts;

        if (abortController.current) {
          abortController.current.abort();
        }
        abortController.current = new AbortController();

        try {
          if (append) {
            setIsLoadingMore(true);
          } else {
            setIsLoading(true);
          }

          let formatted: FormattedTransaction[];
          let next: string | null;

          if (currency === 'USD') {
            const response = await FundraiseService.getUsdContributions({ page });
            formatted = response.results.map(formatUsdContribution);
            next = response.next;
          } else {
            const response = await TransactionService.getTransactions(page);
            formatted = response.results.map((tx) => formatTransaction(tx, exchangeRate, showUSD));
            next = response.next;
          }

          setTransactions((prev) => (page === INITIAL_PAGE ? formatted : [...prev, ...formatted]));
          setHasNextPage(!!next);
          setCurrentPage(page);
          setError(null);
        } catch (err) {
          if (err instanceof Error && err.name === 'AbortError') return;
          console.error('Error fetching transactions:', err);
          setError('Failed to load transactions');
          toast.error('Failed to load transactions');
        } finally {
          setIsLoading(false);
          setIsLoadingMore(false);
        }
      },
      [session, feedCurrency, exchangeRate, showUSD]
    );

    const refresh = async () => {
      if (!session || isRefreshing) return;
      setIsRefreshing(true);
      try {
        await fetchTransactions(INITIAL_PAGE);
      } finally {
        setIsRefreshing(false);
      }
    };

    useImperativeHandle(ref, () => ({ refresh }), [session, isRefreshing, fetchTransactions]);

    // Initial / on-currency-change fetch.
    useEffect(() => {
      if (status === 'loading') return;
      if (!session) {
        setIsLoading(false);
        return;
      }
      fetchTransactions(INITIAL_PAGE);
      // Don't depend on fetchTransactions itself (would re-run on every render).
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status, feedCurrency]);

    // Auto-load next page once the sentinel scrolls into view.
    useEffect(() => {
      if (inView && hasNextPage && !isLoading && !isLoadingMore) {
        fetchTransactions(currentPage + 1, { append: true });
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [inView, hasNextPage, isLoading, isLoadingMore, currentPage]);

    const handleCurrencyChange = (next: FeedCurrency) => {
      if (next === feedCurrency) return;
      setFeedCurrency(next);
      setTransactions([]);
      setCurrentPage(INITIAL_PAGE);
      setHasNextPage(false);
    };

    const canExport = !isLoading && transactions.length > 0 && !isExporting;
    const headerActions = (
      <div className="flex items-center gap-2 shrink-0">
        <CurrencyToggle value={feedCurrency} onChange={handleCurrencyChange} />
        <BaseMenu
          align="end"
          trigger={
            <button
              type="button"
              aria-label="More actions"
              className="h-10 w-10 rounded-md flex items-center justify-center text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
          }
        >
          <BaseMenuItem
            onSelect={(e) => {
              if (!canExport) {
                e.preventDefault();
                return;
              }
              onExport();
            }}
            disabled={!canExport}
            className="cursor-pointer"
          >
            <span className="inline-flex items-center gap-2 text-gray-700">
              <FileDown className="h-3.5 w-3.5" />
              {isExporting ? 'Exporting…' : 'Export'}
            </span>
          </BaseMenuItem>
        </BaseMenu>
      </div>
    );

    const userHasNoTransactions =
      transactions.length === 0 && !isLoading && !error && status !== 'unauthenticated';

    return (
      <SectionCard
        title="Recent Transactions"
        actions={status === 'authenticated' ? headerActions : null}
      >
        {status === 'loading' || isLoading ? (
          <div className="space-y-1">
            {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
              <TransactionSkeleton key={index} />
            ))}
          </div>
        ) : status === 'unauthenticated' ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-gray-50 rounded-full p-4 mb-6">
              <Coins className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Welcome to ResearchCoin</h3>
              <p className="text-sm text-gray-600 mb-6">
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
        ) : userHasNoTransactions ? (
          <div className="flex flex-col items-center justify-center py-10">
            <div className="bg-gray-50 rounded-full p-4 mb-6">
              <Coins className="h-8 w-8 text-gray-400" />
            </div>
            <div className="text-center max-w-md">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {feedCurrency === 'USD' ? 'No USD Contributions Yet' : 'No Transactions Yet'}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {feedCurrency === 'USD'
                  ? "You haven't made any USD contributions to fundraises yet."
                  : 'Get started by depositing ResearchCoin or earning RSC by contributing to the community.'}
              </p>
              {feedCurrency === 'RSC' && (
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
              )}
            </div>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              {transactions.map((transaction) => (
                <TransactionFeedItem key={transaction.id} transaction={transaction} />
              ))}
            </div>

            {isLoadingMore && (
              <div className="space-y-1 animate-fadeIn mt-1">
                {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
                  <TransactionSkeleton key={index} />
                ))}
              </div>
            )}

            {/* Sentinel for infinite scroll */}
            {hasNextPage && !isLoadingMore && (
              <div ref={loadMoreRef} className="h-10" aria-hidden="true" />
            )}
          </>
        )}
      </SectionCard>
    );
  }
);

function SectionCard({
  title,
  actions,
  children,
}: {
  title: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4 mx-auto w-full">
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 sm:px-6 py-4 flex flex-col items-stretch gap-3 border-b border-gray-100 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-sm sm:text-base font-bold text-gray-900">{title}</h2>
          {actions}
        </div>
        <div className="px-4 sm:px-6 py-4">{children}</div>
      </div>
    </div>
  );
}

function CurrencyToggle({
  value,
  onChange,
}: {
  value: FeedCurrency;
  onChange: (next: FeedCurrency) => void;
}) {
  return (
    <PillTabs
      tabs={[
        { id: 'RSC', label: 'ResearchCoin' },
        { id: 'USD', label: 'DAF Contributions' },
      ]}
      activeTab={value}
      onTabChange={(id) => onChange(id as FeedCurrency)}
      size="sm"
    />
  );
}
