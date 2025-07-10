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
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { formatBalance } from '@/components/ResearchCoin/lib/types';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { usePendingDeposits } from '@/hooks/usePendingDeposits';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useUser } from '@/contexts/UserContext';

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { exchangeRate, isLoading: isFetchingExchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
  const { user } = useUser();
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
        {/* Mobile header */}
        <MainPageHeader
          title={showUSD ? 'My USD Wallet' : 'My ResearchCoin'}
          subtitle={
            showUSD
              ? 'Manage your USD wallet and transactions'
              : 'Manage your RSC wallet and transactions'
          }
          icon={<ResearchCoinIcon outlined size={24} color="#000" />}
        />

        <div className="py-6">
          <div className="flex">
            <div className="flex-1">
              {status === 'authenticated' && (
                <UserBalanceSection
                  balance={balance ? formatBalance(balance, exchangeRate) : null}
                  isFetchingExchangeRate={isFetchingExchangeRate}
                  onTransactionSuccess={handleRefresh}
                  lockedBalance={
                    user?.lockedBalance ? formatBalance(user.lockedBalance, exchangeRate) : null
                  }
                />
              )}

              {(hasPendingDepositFeed || isLoadingPendingDeposits) &&
                status === 'authenticated' && <PendingDepositFeed />}

              <TransactionFeed
                ref={transactionFeedRef}
                onExport={handleExport}
                exchangeRate={exchangeRate}
                showUSD={showUSD}
                isExporting={isExporting}
                onRefresh={handleRefresh}
                isRefreshing={isRefreshing}
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
