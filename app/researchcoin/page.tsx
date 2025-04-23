'use client';

import { useState, useEffect, useRef } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { UserBalanceSection } from '@/components/ResearchCoin/UserBalanceSection';
import { TransactionFeed } from '@/components/ResearchCoin/TransactionFeed';
import { PendingDepositFeed } from '@/components/ResearchCoin/PendingDepositFeed';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { TransactionService } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatBalance } from '@/components/ResearchCoin/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { usePendingDeposits } from '@/hooks/usePendingDeposits';
import { RefreshCw } from 'lucide-react';

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { exchangeRate, isLoading: isFetchingExchangeRate } = useExchangeRate();
  const {
    hasPendingDepositFeed,
    isLoading: isLoadingPendingDeposits,
    refreshDeposits,
  } = usePendingDeposits();
  const transactionFeedRef = useRef<{ refresh: () => Promise<void> }>(null);

  // Fetch initial data
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      return;
    }

    fetchBalance();
  }, [session, status]);

  const fetchBalance = async () => {
    try {
      const balanceResponse = await TransactionService.getUserBalance();
      setBalance(balanceResponse);
    } catch (error) {
      console.error('Failed to fetch balance:', error);
    }
  };

  const handleRefresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      // Refresh all data in parallel
      await Promise.all([
        refreshDeposits(),
        fetchBalance(),
        // Also refresh transaction feed if ref is available
        transactionFeedRef.current?.refresh() || Promise.resolve(),
      ]);
    } catch (error) {
      console.error('Failed to refresh data:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full">
        <div className="flex justify-between items-center">
          <PageHeader title="My ResearchCoin" />
          <button
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            onClick={handleRefresh}
            disabled={isRefreshing}
            aria-label="Refresh"
          >
            <RefreshCw className={`h-5 w-5 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="py-6">
          <div className="flex">
            <div className="flex-1">
              {status === 'authenticated' && (
                <UserBalanceSection
                  balance={balance ? formatBalance(balance, exchangeRate) : null}
                  isFetchingExchangeRate={isFetchingExchangeRate}
                  onTransactionSuccess={handleRefresh}
                />
              )}

              {(hasPendingDepositFeed || isLoadingPendingDeposits) &&
                status === 'authenticated' && <PendingDepositFeed />}

              <TransactionFeed
                ref={transactionFeedRef}
                onExport={handleExport}
                exchangeRate={exchangeRate}
                isExporting={isExporting}
              />

              {isExportModalOpen && (
                <ExportFilterModal
                  isOpen={isExportModalOpen}
                  onClose={() => setIsExportModalOpen(false)}
                  onExportStateChange={setIsExporting}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}
