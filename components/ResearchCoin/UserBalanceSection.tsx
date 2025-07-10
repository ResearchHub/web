'use client';

import { ArrowDownToLine, ArrowUpFromLine, Plus, Minus, InfoIcon } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { BuyModal } from '@/components/modals/ResearchCoin/BuyModal';
import { SellModal } from '@/components/modals/ResearchCoin/SellModal';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useAccount } from 'wagmi';
import { Tooltip } from '@/components/ui/Tooltip';

interface UserBalanceSectionProps {
  balance: {
    formatted: string;
    formattedUsd: string;
    raw: number;
  } | null;
  lockedBalance: {
    formatted: string;
    formattedUsd: string;
    raw: number;
  } | null;
  isFetchingExchangeRate: boolean;
  onTransactionSuccess?: () => void;
}

export function UserBalanceSection({
  balance,
  lockedBalance,
  isFetchingExchangeRate,
  onTransactionSuccess,
}: UserBalanceSectionProps) {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Check if wallet is connected and get currency preference
  const { isConnected } = useAccount();
  const { showUSD } = useCurrencyPreference();

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
                        {showUSD ? (
                          <span className="text-3xl font-semibold text-gray-900">$</span>
                        ) : (
                          <ResearchCoinIcon size={28} />
                        )}
                        <div className="flex items-baseline">
                          <span className="text-4xl font-semibold text-gray-900">
                            {showUSD
                              ? balance?.formattedUsd?.replace(/[^\d.,-]/g, '') || '0.00'
                              : balance?.formatted || '0.00'}
                          </span>
                          <span className="text-xl font-medium text-gray-600 ml-2">
                            {showUSD ? 'USD' : 'RSC'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-sm font-medium text-gray-600">
                        {showUSD ? (
                          <>
                            <span>≈</span>
                            <ResearchCoinIcon size={16} />
                            <span>{`${balance?.formatted ?? '0.00'} RSC`}</span>
                          </>
                        ) : (
                          `≈ ${balance?.formattedUsd ?? '$0.00'}`
                        )}
                      </div>
                    </>
                  )}
                </div>

                {/* Locked Balance Section - Only show if locked balance > 0 */}
                {lockedBalance && lockedBalance.raw > 0 && (
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      {showUSD ? (
                        <span className="text-lg font-semibold text-gray-600">$</span>
                      ) : (
                        <ResearchCoinIcon size={20} />
                      )}
                      <div className="flex items-baseline">
                        <span className="text-xl font-medium text-gray-600">
                          {showUSD
                            ? lockedBalance.formattedUsd?.replace(/[^\d.,-]/g, '') || '0.00'
                            : lockedBalance.formatted || '0.00'}
                        </span>
                        <span className="text-sm font-medium text-gray-500 ml-2">
                          {showUSD ? 'USD' : 'RSC'} Locked
                        </span>
                        <Tooltip
                          content={
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-900">Locked Balance</div>
                              <div className="text-sm text-gray-600">
                                Locked funds cannot be used for buying/selling, creating bounties,
                                or tipping, but are available for research funding.
                              </div>
                            </div>
                          }
                          position="top"
                          width="w-80"
                        >
                          <InfoIcon
                            size={14}
                            className="text-gray-400 hover:text-gray-600 cursor-help ml-1"
                          />
                        </Tooltip>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-xs font-medium text-gray-500">
                      {showUSD ? (
                        <>
                          <span>≈</span>
                          <ResearchCoinIcon size={12} />
                          <span>{`${lockedBalance.formatted ?? '0.00'} RSC Locked`}</span>
                        </>
                      ) : (
                        `≈ ${lockedBalance.formattedUsd ?? '$0.00'} Locked`
                      )}
                    </div>
                  </div>
                )}

                {isConnected ? (
                  <>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setIsBuyModalOpen(true)}
                        variant="default"
                        size="lg"
                        className="gap-2 px-3 sm:px-4"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:inline-block sm:flex-shrink-0">Buy RSC</span>
                      </Button>
                      <Button
                        onClick={() => setIsSellModalOpen(true)}
                        variant="default"
                        size="lg"
                        className="gap-2 px-3 sm:px-4"
                      >
                        <Minus className="h-5 w-5" />
                        <span className="hidden sm:inline-block sm:flex-shrink-0">Sell RSC</span>
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
                        To buy, sell, deposit or withdraw RSC, start by connecting your wallet.
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
          <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} />
          <SellModal isOpen={isSellModalOpen} onClose={() => setIsSellModalOpen(false)} />
        </>
      )}
    </>
  );
}
