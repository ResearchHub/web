'use client';

import { ArrowDownToLine, ArrowUpFromLine, Plus } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { SwapModal } from '@/components/modals/ResearchCoin/SwapModal';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { useAccount } from 'wagmi';

interface UserBalanceSectionProps {
  balance: {
    formatted: string;
    formattedUsd: string;
    raw: number;
  } | null;
  isFetchingExchangeRate: boolean;
  onTransactionSuccess?: () => void;
}

export function UserBalanceSection({
  balance,
  isFetchingExchangeRate,
  onTransactionSuccess,
}: UserBalanceSectionProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);

  // Check if wallet is connected
  const { isConnected } = useAccount();

  // Only consider balance as not ready if we're fetching exchange rate
  // Zero balance (balance = 0) should be treated as a valid state
  const isBalanceReady = !isFetchingExchangeRate;

  return (
    <>
      <div className="mb-6 mx-auto w-full">
        <div className="px-0 pb-8">
          <div className="flex flex-col space-y-8">
            <div className="flex justify-between items-start">
              {/* Balance Section */}
              <div className="space-y-6">
                <div className="space-y-1">
                  {!isBalanceReady ? (
                    <div className="space-y-2">
                      <div className="h-10 w-58 bg-gray-200 animate-pulse rounded" />
                      <div className="h-5 w-32 bg-gray-200 animate-pulse rounded" />
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-3">
                        <ResearchCoinIcon size={28} />
                        <div className="flex items-baseline">
                          <span className="text-4xl font-semibold text-gray-900">
                            {balance?.formatted || '0.00'}
                          </span>
                          <span className="text-xl font-medium text-gray-600 ml-2">RSC</span>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-600">
                        ≈ {balance?.formattedUsd || '$0.00'}
                      </div>
                    </>
                  )}
                </div>

                {isConnected ? (
                  <>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setIsSwapModalOpen(true)}
                        variant="default"
                        size="lg"
                        className="gap-2 px-3 sm:px-4"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline-block sm:flex-shrink-0">Buy RSC</span>
                      </Button>
                      <Button
                        onClick={() => setIsDepositModalOpen(true)}
                        variant="outlined"
                        size="lg"
                        className="gap-2 px-3 sm:px-4"
                        disabled={!isBalanceReady}
                        data-action="deposit"
                      >
                        <ArrowDownToLine className="h-5 w-5" />
                        <span className="hidden sm:inline-block sm:flex-shrink-0">Deposit</span>
                      </Button>
                      <Button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        variant="outlined"
                        size="lg"
                        className="gap-2 px-3 sm:px-4"
                        disabled={!isBalanceReady}
                      >
                        <ArrowUpFromLine className="h-5 w-5" />
                        <span className="hidden sm:inline-block sm:flex-shrink-0">Withdraw</span>
                      </Button>

                      <WalletDefault />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <p className="text-base text-gray-600">
                        To purchase, deposit or withdraw RSC, start by connecting your wallet.
                      </p>
                    </div>
                    <WalletDefault />
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="h-px bg-gray-200" />
      </div>

      {/* Modals */}
      {isBalanceReady && (
        <>
          <DepositModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            currentBalance={balance?.raw || 0}
            onSuccess={onTransactionSuccess}
          />
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={balance?.raw || 0}
            onSuccess={onTransactionSuccess}
          />
          <SwapModal isOpen={isSwapModalOpen} onClose={() => setIsSwapModalOpen(false)} />
        </>
      )}
    </>
  );
}
