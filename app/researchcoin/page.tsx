'use client';

import { useEffect, useState } from 'react';
import { PageLayout } from '@/app/layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { UserBalanceSection } from '@/components/ResearchCoin/UserBalanceSection';
import { TransactionFeed } from '@/components/ResearchCoin/TransactionFeed';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { useSession } from 'next-auth/react';
import { PageHeader } from '@/components/ui/PageHeader';
import { TransactionService } from '@/services/transaction.service';
import { ExchangeRateService } from '@/services/exchangeRate.service';

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const [exchangeRate, setExchangeRate] = useState<number>(0);
  const [userBalance, setUserBalance] = useState<number | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isFetchingExchangeRate, setIsFetchingExchangeRate] = useState(true);

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
          ExchangeRateService.getLatestRate(),
        ]);

        setUserBalance(balanceResponse.user.balance);
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
      <div className="w-full">
        <PageHeader title="ResearchCoin" />

        <div className="py-6">
          <div className="lg:col-span-2">
            <UserBalanceSection
              balance={userBalance}
              exchangeRate={exchangeRate}
              isFetchingExchangeRate={isFetchingExchangeRate}
            />
            <div className="mt-6">
              <TransactionFeed
                onExport={handleExport}
                exchangeRate={exchangeRate}
                isExporting={isExporting}
              />
            </div>
          </div>
          <div className="lg:col-span-1 lg:hidden">
            <ResearchCoinRightSidebar />
          </div>
        </div>
      </div>

      {isExportModalOpen && (
        <ExportFilterModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          onExportStateChange={setIsExporting}
        />
      )}
    </PageLayout>
  );
}
