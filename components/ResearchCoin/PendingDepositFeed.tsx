'use client';

import { HelpCircle, RefreshCw } from 'lucide-react';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { usePendingDeposits } from '@/hooks/usePendingDeposits';
import { PendingDepositItem } from './PendingDepositItem';

const LOADING_SKELETON_COUNT = 2;

interface PendingDepositFeedProps {
  exchangeRate: number;
}

export function PendingDepositFeed({ exchangeRate }: PendingDepositFeedProps) {
  const { deposits, isLoading, isRefreshing, refreshDeposits } = usePendingDeposits();

  if (isLoading) {
    return (
      <div className="mb-8 w-full">
        <div className="bg-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-800">Pending Deposits</h2>
              <div className="group relative">
                <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                <div
                  className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 
                  bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible
                  group-hover:opacity-100 group-hover:visible transition-all duration-200
                  whitespace-nowrap shadow-lg z-10 w-max max-w-md"
                >
                  Deposits are typically confirmed within 10-20 minutes
                  <div
                    className="absolute left-1/2 -translate-x-1/2 top-full
                    border-4 border-transparent border-t-gray-900"
                  ></div>
                </div>
              </div>
            </div>
            <RefreshCw className="h-5 w-5 text-gray-400" />
          </div>
          <div className="space-y-1">
            {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
              <TransactionSkeleton key={index} />
            ))}
          </div>
        </div>
        <div className="h-px bg-gray-200 mt-8" />
      </div>
    );
  }

  // Don't render anything if no pending deposits
  if (deposits.length === 0) {
    return null;
  }

  return (
    <div className="mb-8 w-full">
      <div className="bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-gray-800">Pending Deposits</h2>
            <div className="group relative">
              <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
              <div
                className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 
                bg-gray-900 text-white text-sm rounded-lg opacity-0 invisible
                group-hover:opacity-100 group-hover:visible transition-all duration-200
                whitespace-nowrap shadow-lg z-10 w-max max-w-md"
              >
                Deposits are typically confirmed within 10-20 minutes
                <div
                  className="absolute left-1/2 -translate-x-1/2 top-full
                  border-4 border-transparent border-t-gray-900"
                ></div>
              </div>
            </div>
          </div>
          <RefreshCw
            className={`h-5 w-5 ${isRefreshing ? 'animate-spin text-gray-400' : 'text-gray-600 hover:text-gray-800 cursor-pointer transition-colors'}`}
            onClick={() => !isRefreshing && refreshDeposits()}
          />
        </div>

        <div className="space-y-1">
          {deposits.map((deposit) => (
            <PendingDepositItem key={deposit.id} deposit={deposit} />
          ))}
        </div>
      </div>

      <div className="h-px bg-gray-200 mt-8" />
    </div>
  );
}
