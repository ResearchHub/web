'use client';

import { useState, useEffect } from 'react';
import { TransactionService, PendingDeposit } from '@/services/transaction.service';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { useSession } from 'next-auth/react';
import { Coins, AlertCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const LOADING_SKELETON_COUNT = 2;

interface PendingDepositItemProps {
  deposit: PendingDeposit;
  exchangeRate: number;
}

function PendingDepositItem({ deposit, exchangeRate }: PendingDepositItemProps) {
  const date = new Date(deposit.created_date);
  const formattedDate = date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const formattedTime = date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });

  // Determine which blockchain explorer to use based on network
  const getExplorerLink = () => {
    const baseUrl =
      deposit.network === 'ETHEREUM' ? 'https://etherscan.io/tx/' : 'https://basescan.org/tx/';
    return `${baseUrl}${deposit.transaction_hash}`;
  };

  return (
    <div className="p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors">
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">Deposit (Pending)</span>
            <span className="px-2 py-0.5 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
              Pending
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
            <span>
              {formattedDate} at {formattedTime}
            </span>
            <span>•</span>
            <a
              href={getExplorerLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              View transaction
              <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
        <div className="text-right">
          <div className="text-sm font-semibold text-green-600">+{deposit.amount} RSC</div>
          <div className="text-xs text-gray-500">
            ~${(deposit.amount * exchangeRate).toFixed(2)} USD
          </div>
        </div>
      </div>
    </div>
  );
}

interface PendingDepositsProps {
  exchangeRate: number;
}

export function PendingDeposits({ exchangeRate }: PendingDepositsProps) {
  const { data: session, status } = useSession();
  const [deposits, setDeposits] = useState<PendingDeposit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'loading') return;

    if (!session) {
      setIsLoading(false);
      return;
    }

    fetchPendingDeposits();
  }, [session, status]);

  async function fetchPendingDeposits() {
    if (!session) return;

    try {
      setIsLoading(true);
      // Filter at the API level by passing 'PENDING' status
      const response = await TransactionService.getPendingDeposits('PENDING');
      setDeposits(response.results);
    } catch (err) {
      console.error('Error fetching pending deposits:', err);
      setError('Failed to load pending deposits');
      toast.error('Failed to load pending deposits');
    } finally {
      setIsLoading(false);
    }
  }

  // Don't render anything if no pending deposits and not loading
  if (!isLoading && deposits.length === 0) {
    return null;
  }

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 mb-8">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-800">Pending Deposits</h2>
          </div>
        </div>
        <div className="space-y-0">
          {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
            <TransactionSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 mb-8">
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-800">Pending Deposits</h2>
          <div className="flex items-center px-2 py-0.5 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-700">
            <AlertCircle className="h-3 w-3 mr-1" />
            Processing
          </div>
        </div>
      </div>

      <div>
        {deposits.map((deposit) => (
          <PendingDepositItem key={deposit.id} deposit={deposit} exchangeRate={exchangeRate} />
        ))}
      </div>

      <div className="p-4 bg-gray-50 text-xs text-gray-500">
        Deposits typically take 10-20 minutes to process once confirmed on the blockchain.
      </div>
    </div>
  );
}
