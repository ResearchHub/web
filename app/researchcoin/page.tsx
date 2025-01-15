'use client'

import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { UserBalanceSection } from '@/components/ResearchCoin/UserBalanceSection';
import { TransactionFeed } from '@/components/ResearchCoin/TransactionFeed';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { TransactionService } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import type { TransformedBalance } from '@/services/transaction.service';

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [balance, setBalance] = useState<TransformedBalance | null>(null);
  const { exchangeRate, isLoading: isFetchingExchangeRate } = useExchangeRate();

  // Fetch initial data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      return;
    }

    const fetchInitialData = async () => {
      try {
        const balanceResponse = await TransactionService.getUserBalance(exchangeRate);
        setBalance(balanceResponse);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      }
    };

    fetchInitialData();
  }, [session, status, exchangeRate]);

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="flex">
        <div className="flex-1">
          <UserBalanceSection
            balance={balance}
            isFetchingExchangeRate={isFetchingExchangeRate}
          />

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
    </PageLayout>
  );
} 