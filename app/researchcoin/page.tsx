'use client'

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { ArrowUpFromLine, ArrowDownToLine, Gauge, Coins, ExternalLink, AlertCircle, InfoIcon } from 'lucide-react';
import { PageLayout } from '../layouts/PageLayout';
import toast from 'react-hot-toast';
import { ResearchCoinRightSidebar } from '@/components/ResearchCoin/ResearchCoinRightSidebar';
import { TransactionService, transformTransactionResponse } from '@/services/transaction.service';
import { TransactionDTO } from '@/services/types/transaction.dto';
import Image from 'next/image';
import { TransactionList } from '@/components/ResearchCoin/TransactionList';
import { TransactionSkeleton } from '@/components/ResearchCoin/TransactionSkeleton';

const DISTRIBUTION_TYPES = {
  'EDITOR_BOUNTY': 'Editor Bounty',
  'PAPER_UPVOTED': 'Paper Upvote',
  'COMMENT_UPVOTED': 'Comment Upvote',
  'RESEARCH_UPVOTED': 'Research Upvote',
  'PURCHASING_POWER': 'Purchasing Power',
  'RhCOMMENT': 'Comment',
  'STORED_REWARD': 'Stored Reward',
  'THREAD_REWARD': 'Thread Reward',
  'PAPER_REWARD': 'Paper Reward',
  'EDITOR_CONTRIBUTION': 'Editor Contribution',
  'COMMENT_REWARD': 'Comment Reward',
  'RhCOMMENT_UPVOTED': 'Comment Upvote Reward',
  'RESEARCHHUB_POST_UPVOTED': 'Post Upvote Reward',
  'MOD_PAYMENT': 'Moderator Payment',
  'REPLY_COMMENT': 'Reply Comment',
  'PURCHASE': 'Purchase',
  'PURCHASE_BOOST': 'Content Boost',
  'PURCHASE_TIP': 'Tip',
  'SUPPORT_RH_FEE': 'Support RH Fee',
} as const;

type DistributionType = keyof typeof DISTRIBUTION_TYPES;

export default function ResearchCoinPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [balance] = useState('1,566.87');
  const [transactions, setTransactions] = useState<TransactionDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageUrl, setNextPageUrl] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  
  const observerTarget = useRef<HTMLDivElement>(null);

  // Check authentication status
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin?callbackUrl=/researchcoin');
    }
  }, [status, router]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await TransactionService.getTransactions();
      const transformedData = transformTransactionResponse(response);
      setTransactions(transformedData.results);
      setNextPageUrl(transformedData.next);
    } catch (err) {
      if (err instanceof AuthRequiredError) {
        setError('Please sign in to view your transactions');
        router.push('/auth/signin?callbackUrl=/researchcoin');
      } else {
        setError('Failed to load transactions');
        console.error(err);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNextPage = async () => {
    if (!nextPageUrl || isLoadingMore || !session?.authToken) return;

    try {
      setIsLoadingMore(true);
      const response = await TransactionService.getTransactionsByUrl(nextPageUrl);
      const transformedData = transformTransactionResponse(response);
      setTransactions(prev => [...prev, ...transformedData.results]);
      setNextPageUrl(transformedData.next);
    } catch (err) {
      console.error('Error loading more transactions:', err);
      toast.error('Failed to load more transactions');
    } finally {
      setIsLoadingMore(false);
    }
  };

  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const [target] = entries;
    if (target.isIntersecting && nextPageUrl) {
      fetchNextPage();
    }
  }, [nextPageUrl]);

  // Only fetch transactions when session is available
  useEffect(() => {
    if (session?.authToken) {
      fetchTransactions();
    }
  }, [session]);

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="space-y-4">
            <TransactionSkeleton />
            <TransactionSkeleton />
            <TransactionSkeleton />
          </div>
        </div>
      </PageLayout>
    );
  }

  // Show error state if not authenticated
  if (status === 'unauthenticated') {
    return null; // Router will redirect to sign-in page
  }

  const handleActionClick = (action: string) => {
    toast((t) => (
      <div className="flex items-center space-x-2">
        <AlertCircle className="h-5 w-5" />
        <span>{action} coming soon</span>
      </div>
    ), {
      duration: 2000,
      position: 'bottom-right',
      style: {
        background: '#FFF7ED', // Orange-50
        color: '#EA580C',     // Orange-600
        border: '1px solid #FDBA74', // Orange-300
      },
    });
  };

  const formatTransactionAmount = (transaction: TransactionDTO) => {
    if (!transaction?.amount) return '0 RSC';
    const amount = parseFloat(transaction.amount);
    // Format with 2 decimal places only if there are decimals
    const formattedAmount = amount % 1 === 0 ? amount.toString() : amount.toFixed(2);
    return `${amount >= 0 ? '+' : ''}${formattedAmount} RSC`;
  };

  const getTransactionType = (transaction: TransactionDTO) => {
    // First check if it's a purchase by readable_content_type
    if (transaction.readable_content_type === 'purchase') {
      const purchaseType = transaction.source?.purchase_type;
      if (purchaseType === 'BOOST') {
        return DISTRIBUTION_TYPES['PURCHASE_BOOST'];
      } else if (purchaseType === 'TIP') {
        return DISTRIBUTION_TYPES['PURCHASE_TIP'];
      }
      return DISTRIBUTION_TYPES['PURCHASE'];
    }

    // Support fee check
    if (transaction.readable_content_type === 'supportfee') {
      return DISTRIBUTION_TYPES['SUPPORT_RH_FEE'];
    }

    // Check distribution type
    if (transaction?.source?.distribution_type) {
      const type = transaction.source.distribution_type as DistributionType;
      return DISTRIBUTION_TYPES[type] || type.split('_')
        .map(word => word.charAt(0) + word.slice(1).toLowerCase())
        .join(' ');
    }

    return 'Unknown Transaction';
  };

  const handleToggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <PageLayout rightSidebar={<ResearchCoinRightSidebar />}>
      <div className="flex">
        <div className="flex-1">
          {/* Balance Card */}
          <div className="bg-white rounded-xl shadow-sm mb-6 max-w-[800px] mx-auto w-full">
            <div className="p-8">
              <div className="flex flex-col items-center lg:flex-row lg:justify-center gap-8">
                {/* Balance Section */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2">
                    <h2 className="text-xl font-semibold text-gray-900">Your Balance</h2>
                    <div className="group relative">
                      <InfoIcon className="h-5 w-5 text-gray-400 cursor-help" />
                      <div className="hidden group-hover:block absolute left-0 top-full mt-2 w-64 p-3 
                        bg-gray-900 text-white text-sm rounded-lg shadow-lg z-10">
                        ResearchCoin (RSC) is earned by contributing to academic research through 
                        peer reviews, fundraising, and earning rewards. Use it to support other researchers 
                        or withdraw to your wallet.
                      </div>
                    </div>
                  </div>

                  <div className="w-[300px] space-y-2 p-2">
                    <div className="flex items-center gap-3 px-2">
                      <Image
                        src="/coin-filled.png"
                        alt="RSC"
                        width={28}
                        height={28}
                        className="object-contain"
                      />
                      <span className="text-3xl font-semibold text-gray-900">{balance}</span>
                      <span className="text-base font-medium text-gray-500">RSC</span>
                    </div>
                    <div className="text-lg text-gray-500 px-2">
                      ≈ $2,469.12 USD
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center px-0 gap-12 mx-4 lg:ml-auto">
                  <button 
                    onClick={() => handleActionClick('Deposit RSC')}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-indigo-600 
                      text-white rounded-full hover:bg-indigo-700 transition-all duration-200 
                      shadow-sm hover:shadow-md"
                    >
                      <ArrowDownToLine className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Deposit</span>
                  </button>
                  
                  <button 
                    onClick={() => handleActionClick('Withdraw RSC')}
                    className="flex flex-col items-center gap-3"
                  >
                    <div className="w-16 h-16 flex items-center justify-center bg-white 
                      text-gray-700 rounded-full hover:bg-gray-50 transition-all duration-200 
                      border-2 border-gray-200 shadow-sm hover:shadow-md"
                    >
                      <ArrowUpFromLine className="h-7 w-7" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">Withdraw</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Transactions */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Recent Transactions</h2>
            <TransactionList
              transactions={transactions}
              isLoading={isLoading}
              error={error}
              expandedId={expandedId}
              onToggleExpand={handleToggleExpand}
            />
            {nextPageUrl && (
              <div ref={observerTarget} className="mt-4">
                {isLoadingMore && (
                  <div className="space-y-4">
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                    <TransactionSkeleton />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
} 