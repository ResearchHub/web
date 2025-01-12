'use client'

import { useState, useEffect } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { UserBalanceSection } from '@/components/ResearchCoin/UserBalanceSection';
import { TransactionFeed } from '@/components/ResearchCoin/TransactionFeed';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { TransactionService } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import type { TransactionAPIResponse } from '@/services/types/transaction.dto';
import { ExchangeRateService } from '@/services/exchangeRate.service';

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [balance, setBalance] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [isFetchingExchangeRate, setIsFetchingExchangeRate] = useState(true);

  // Fetch initial data
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      setIsFetchingExchangeRate(false);
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [balanceResponse, rateResponse] = await Promise.all([
          TransactionService.getUserBalance(),
          ExchangeRateService.getLatestRate()
        ]);
        
        setBalance(balanceResponse.user.balance);
        setExchangeRate(rateResponse);
      } catch (error) {
        console.error('Failed to fetch initial data:', error);
      } finally {
        setIsFetchingExchangeRate(false);
      }
    };

    fetchInitialData();
  }, [session, status]);

  const handleExport = () => {
    setIsExportModalOpen(true);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="flex">
        <div className="flex-1">
          <UserBalanceSection
            balance={balance}
            exchangeRate={exchangeRate}
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