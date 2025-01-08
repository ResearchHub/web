'use client'

import { useState, useEffect, useCallback } from 'react';
import { PageLayout } from '../layouts/PageLayout';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { BalanceCard } from '@/components/ResearchCoin/BalanceCard';
import { TransactionsSection } from '@/components/ResearchCoin/TransactionsSection';
import { ExportFilterModal, ExportProvider } from '@/components/modals/ResearchCoin/ExportFilterModal';
import { TransactionService } from '@/services/transaction.service';
import { useSession } from 'next-auth/react';
import type { TransactionAPIResponse } from '@/services/types/transaction.dto';

const STORAGE_KEY = 'researchhub_page_cache';
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

interface PageCache {
  balance: number;
  exchangeRate: number;
  transactions: TransactionAPIResponse['results'];
  timestamp: number;
}

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number>(1.576);
  const [transactions, setTransactions] = useState<TransactionAPIResponse['results']>([]);

  // Initialize from cache
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    try {
      const cached = sessionStorage.getItem(STORAGE_KEY);
      if (!cached) return;
      
      const parsedCache: PageCache = JSON.parse(cached);
      const isExpired = Date.now() - parsedCache.timestamp > CACHE_EXPIRY;
      
      if (!isExpired) {
        setBalance(parsedCache.balance);
        setExchangeRate(parsedCache.exchangeRate);
        setTransactions(parsedCache.transactions);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error reading from cache:', error);
    }
  }, []);

  // Fetch all data at once
  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      setIsLoading(false);
      return;
    }

    const fetchAllData = async () => {
      try {
        const [balanceResponse, rateResponse, transactionsResponse] = await Promise.all([
          TransactionService.getUserBalance(),
          TransactionService.getLatestExchangeRate(),
          TransactionService.getTransactions(1)
        ]);
        
        const newBalance = balanceResponse.user.balance;
        const newRate = rateResponse.results[0]?.rate ?? 1.576;
        const newTransactions = transactionsResponse.results;

        setBalance(newBalance);
        setExchangeRate(newRate);
        setTransactions(newTransactions);

        // Update cache
        const cacheData: PageCache = {
          balance: newBalance,
          exchangeRate: newRate,
          transactions: newTransactions,
          timestamp: Date.now()
        };
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
      } catch (error) {
        console.error('Failed to fetch page data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isLoading || transactions.length === 0) {
      fetchAllData();
    }
  }, [session, status]);

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="flex">
        <div className="flex-1">
          <BalanceCard
            balance={balance}
            exchangeRate={exchangeRate}
            isLoading={isLoading}
          />

          <TransactionsSection 
            onExportClick={() => setIsExportModalOpen(true)}
            initialTransactions={transactions}
            isInitialLoading={isLoading}
          />

          <ExportProvider>
            {isExportModalOpen && (
              <ExportFilterModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
              />
            )}
          </ExportProvider>
        </div>
      </div>
    </PageLayout>
  );
} 