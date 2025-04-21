'use client';

import { useState, useEffect, useCallback } from 'react';
import { TransactionService, PendingDeposit } from '@/services/transaction.service';
import { TransactionSkeleton } from '@/components/skeletons/TransactionSkeleton';
import { useSession } from 'next-auth/react';
import { Coins, HelpCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

const LOADING_SKELETON_COUNT = 2;

// Network configuration based on environment
const IS_PRODUCTION = process.env.NEXT_PUBLIC_VERCEL_ENV === 'production';
const NETWORK_NAME = IS_PRODUCTION ? 'Base' : 'Base Sepolia';
const BLOCK_EXPLORER_URL = IS_PRODUCTION
  ? 'https://basescan.org/tx/'
  : 'https://sepolia.basescan.org/tx/';

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

  // Get explorer link based on environment rather than network type
  const getExplorerLink = () => {
    return `${BLOCK_EXPLORER_URL}${deposit.transaction_hash}`;
  };

  return (
    <div className="p-4 bg-white">
      <div className="flex justify-between items-start">
        <div className="flex gap-3">
          <div className="mt-0.5">
            <div className="bg-green-100 rounded-full p-2 flex items-center justify-center">
              <Coins className="h-4 w-4 text-green-600" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">Deposit</span>
            </div>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
              <span>
                {formattedDate} at {formattedTime}
              </span>
              <span>•</span>
              <div className="flex items-center gap-1">
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

  // Function to fetch all pages of deposits
  const fetchAllDeposits = useCallback(async () => {
    if (!session) return [];

    try {
      let allDeposits: PendingDeposit[] = [];
      let nextPageUrl: string | null = null;
      let currentPage = 1;

      do {
        // Get the current page of deposits
        const response = await TransactionService.getDeposits(currentPage);

        // Add the results to our collection
        allDeposits = [...allDeposits, ...response.results];

        // Update pagination info for the next iteration
        nextPageUrl = response.next;
        currentPage++;
      } while (nextPageUrl !== null);

      return allDeposits;
    } catch (err) {
      console.error('Error fetching all deposits:', err);
      throw err;
    }
  }, [session]);

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

      // Fetch all deposits across all pages
      const allDeposits = await fetchAllDeposits();

      // Filter for pending deposits only
      const pendingDeposits = allDeposits.filter((deposit) => deposit.paid_status === 'PENDING');

      // Sort deposits by date in descending order (most recent first)
      const sortedDeposits = [...pendingDeposits].sort((a, b) => {
        return new Date(b.created_date).getTime() - new Date(a.created_date).getTime();
      });

      setDeposits(sortedDeposits);
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
      <div className="mb-8 w-full">
        <div className="p-4 bg-white">
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
        </div>
        <div className="bg-white space-y-0">
          {[...Array(LOADING_SKELETON_COUNT)].map((_, index) => (
            <TransactionSkeleton key={index} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-8 w-full">
      <div className="p-4 bg-white">
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
      </div>

      <div className="space-y-0">
        {deposits.map((deposit) => (
          <PendingDepositItem key={deposit.id} deposit={deposit} exchangeRate={exchangeRate} />
        ))}
      </div>
    </div>
  );
}
