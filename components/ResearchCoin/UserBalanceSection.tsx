'use client';

import { ArrowDownToLine, ArrowUpFromLine } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
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
}

export function UserBalanceSection({ balance, isFetchingExchangeRate }: UserBalanceSectionProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);

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
                    <div className="flex gap-4">
                      <p className="text-base text-gray-600">
                        Wallet successfully connected. You can now deposit or withdraw RSC.
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setIsDepositModalOpen(true)}
                        variant="default"
                        size="lg"
                        className="gap-2"
                        disabled={!isBalanceReady}
                        data-action="deposit"
                      >
                        <ArrowDownToLine className="h-5 w-5" />
                        Deposit
                      </Button>
                      <Button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        variant="outlined"
                        size="lg"
                        className="gap-2"
                        disabled={!isBalanceReady}
                      >
                        <ArrowUpFromLine className="h-5 w-5" />
                        Withdraw
                      </Button>
                      <WalletDefault />
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex gap-4">
                      <p className="text-base text-gray-600">
                        To deposit or withdraw RSC, start by connecting your wallet.
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
          />
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={balance?.raw || 0}
          />
        </>
      )}
    </>
  );
}
