'use client';

import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { UserBalanceSection } from '@/components/ResearchCoin/UserBalanceSection';
import { TransactionFeed } from '@/components/ResearchCoin/TransactionFeed';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { TransactionService } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { formatBalance } from '@/components/ResearchCoin/lib/types';
import { PageHeader } from '@/components/ui/PageHeader';
import { FundCard } from '@coinbase/onchainkit/fund';

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const { exchangeRate, isLoading: isFetchingExchangeRate } = useExchangeRate();

  // Fetch initial data
  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      return;
    }

    const fetchInitialData = async () => {
      try {
        const balanceResponse = await TransactionService.getUserBalance();
        setBalance(balanceResponse);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, [session, status]);

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="w-full">
        <PageHeader title="My ResearchCoin" />

        <div className="py-6">
          <div className="flex">
            <div className="flex-1">
              <UserBalanceSection
                balance={balance ? formatBalance(balance, exchangeRate) : null}
                isFetchingExchangeRate={isFetchingExchangeRate}
              />
              <div className="pb-6">
                <FundCard assetSymbol="USDC" country="US" currency="USD" />
              </div>
              <TransactionFeed
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
