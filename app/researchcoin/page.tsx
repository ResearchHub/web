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
import { usePendingDeposits } from '@/hooks/usePendingDeposits';
import { useUser } from '@/contexts/UserContext';
import { useVerification } from '@/contexts/VerificationContext';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import { MainPageHeader } from '@/components/ui/MainPageHeader';
import { Icon } from '@/components/ui/icons';
import './researchcoin-wallet.css';

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
  const { openVerificationModal } = useVerification();

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
        <div className="">
          <div className="mb-8">
            <MainPageHeader
              icon={<Icon name="rscThin" size={28} />}
              title="My Wallet"
              subtitle="Manage your wallet and view transactions"
              showTitle={false}
            />
          </div>
          <div className="flex">
            <div className="flex-1">
              {/* Verification Banner */}
              {status === 'authenticated' && user && !user.isVerified && (
                <div className="mb-6 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl px-6 py-5 flex items-center justify-between shadow-lg">
                  <div className="flex items-center gap-3">
                    <div className="bg-white/20 backdrop-blur-sm rounded-full p-2.5 flex items-center justify-center">
                      <VerifiedBadge size="lg" className="brightness-0 invert" />
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-base">
                        Verify your profile for enhanced benefits
                      </h3>
                      <p className="text-white/90 text-sm mt-0.5">
                        Unlock faster withdrawals, exclusive features, and peer review opportunities
                      </p>
                    </div>
                  </div>
                  <Button
                    onClick={openVerificationModal}
                    variant="secondary"
                    size="default"
                    className="bg-white text-blue-600 hover:bg-gray-50 font-medium px-5"
                  >
                    Verify Now
                  </Button>
                </div>
              )}

              {status === 'authenticated' && (
                <UserBalanceSection
                  balance={formatBalance(balance || 0, exchangeRate)}
                  rscBalance={user?.rscBalance}
                  usdCents={user?.usdCents}
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
