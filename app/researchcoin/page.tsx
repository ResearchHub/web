'use client';

import { useState, useRef } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { WalletOverview } from '@/components/ResearchCoin/WalletOverview';
import { TransactionFeed } from '@/components/ResearchCoin/TransactionFeed';
import { PendingDepositFeed } from '@/components/ResearchCoin/PendingDepositFeed';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { useSession } from 'next-auth/react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { usePendingDeposits } from '@/hooks/usePendingDeposits';
import { useUser } from '@/contexts/UserContext';
import { useVerification } from '@/contexts/VerificationContext';
import { VerifiedBadge } from '@/components/ui/VerifiedBadge';
import { Button } from '@/components/ui/Button';
import './researchcoin-wallet.css';

export default function ResearchCoinPage() {
  const { status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const { exchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();
  const { user, refreshUser } = useUser();
  const { openVerificationModal } = useVerification();

  const transactionFeedRef = useRef<{ refresh: () => Promise<void> }>(null);
  const refreshTransactions = () => {
    transactionFeedRef.current?.refresh();
  };

  const { hasPendingDepositFeed } = usePendingDeposits({
    onDepositResolved: () => {
      refreshUser({ silent: true });
      refreshTransactions();
    },
  });

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full">
        <div className="">
          <div className="">
            <h1 className="sr-only">My Wallet</h1>
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
                    onClick={() => openVerificationModal()}
                    variant="secondary"
                    size="default"
                    className="bg-white text-blue-600 hover:bg-gray-50 font-medium px-5"
                  >
                    Verify Now
                  </Button>
                </div>
              )}

              {status === 'authenticated' && (
                <WalletOverview onTransactionSuccess={refreshTransactions} />
              )}

              {hasPendingDepositFeed && status === 'authenticated' && <PendingDepositFeed />}

              <TransactionFeed
                ref={transactionFeedRef}
                onExport={handleExport}
                exchangeRate={exchangeRate}
                showUSD={showUSD}
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
