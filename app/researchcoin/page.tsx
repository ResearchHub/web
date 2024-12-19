'use client'

import { useState } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { BalanceCard } from '@/components/ResearchCoin/BalanceCard';
import { TransactionsSection } from '@/components/ResearchCoin/TransactionsSection';
import { ExportFilterModal } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { DepositModal } from '@/components/modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '@/components/modals/ResearchCoin/WithdrawModal';

export default function ResearchCoinPage() {
  const [balance] = useState('1,566.87');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

  const handleExport = (transactions: any[]) => {
    // Export functionality moved to ExportFilterModal
    setIsExportModalOpen(false);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="flex">
        <div className="flex-1">
          <BalanceCard
            balance={balance}
            onDepositClick={() => setIsDepositModalOpen(true)}
            onWithdrawClick={() => setIsWithdrawModalOpen(true)}
          />

          <TransactionsSection 
            onExportClick={() => setIsExportModalOpen(true)}
          />

          <ExportFilterModal
            isOpen={isExportModalOpen}
            onClose={() => setIsExportModalOpen(false)}
            onExport={handleExport}
          />

          <DepositModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            currentBalance={balance}
          />

          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={balance}
          />
        </div>
      </div>
    </PageLayout>
  );
} 