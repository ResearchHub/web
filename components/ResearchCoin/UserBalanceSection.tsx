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
              <div className="space-y-6 w-full">
                {!isBalanceReady ? (
                  <div className="flex flex-col sm:!flex-row flex-wrap gap-4 w-full">
                    {/* Available Balance Card Skeleton */}
                    <div className="w-full sm:!w-auto sm:!flex-1 bg-gradient-to-r from-purple-600 to-blue-400 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="h-4 w-32 bg-white/20 animate-pulse rounded" />
                        <div className="h-4 w-4 bg-white/20 animate-pulse rounded-full" />
                      </div>
                      <div className="mt-2">
                        <div className="h-8 w-24 bg-white/20 animate-pulse rounded" />
                        <div className="h-4 w-20 bg-white/20 animate-pulse rounded mt-1" />
                      </div>
                    </div>

                    {/* Funding Only Card Skeleton */}
                    <div className="w-full sm:!w-auto sm:!flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                        <div className="h-4 w-4 bg-gray-200 animate-pulse rounded-full" />
                      </div>
                      <div className="mt-2">
                        <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
                        <div className="h-4 w-16 bg-gray-200 animate-pulse rounded mt-1" />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col sm:!flex-row flex-wrap gap-4 w-full">
                    {/* Available Balance Card */}
                    <div
                      className={`w-full sm:!w-auto ${
                        !lockedBalance || lockedBalance.raw === 0 ? 'sm:!w-fit' : 'sm:!flex-1'
                      } bg-gradient-to-r from-purple-600 to-blue-400 rounded-lg p-4 text-white`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="text-sm font-medium text-white/90">Available Balance</span>
                        <Tooltip
                          content={
                            <div className="space-y-2">
                              <div className="font-semibold text-gray-900">Available Balance</div>
                              <div className="text-sm text-gray-600">
                                Funds available for all transactions including buying, selling,
                                creating bounties, and tipping.
                              </div>
                            </div>
                          }
                          position="top"
                          width="w-80"
                        >
                          <InfoIcon
                            size={14}
                            className="text-white/70 hover:text-white cursor-help"
                          />
                        </Tooltip>
                      </div>
                      <div className="mt-2">
                        <div
                          className="text-2xl sm:!text-3xl font-semibold truncate"
                          title={showUSD ? balance?.formattedUsd : balance?.formatted}
                        >
                          {showUSD ? (
                            `${balance?.formattedUsd || '$0.00 USD'}`
                          ) : (
                            <span className="flex items-center gap-2">
                              <ResearchCoinIcon size={24} />
                              {`${balance?.formatted || '0.00'} RSC`}
                            </span>
                          )}
                        </div>
                        <div
                          className="text-sm sm:!text-lg text-white/80 mt-1 truncate"
                          title={
                            showUSD ? `${balance?.formatted ?? '0.00'} RSC` : balance?.formattedUsd
                          }
                        >
                          {showUSD ? (
                            <span className="flex items-center gap-1">
                              ≈ <ResearchCoinIcon size={12} className="inline" />
                              {`${balance?.formatted ?? '0.00'} RSC`}
                            </span>
                          ) : (
                            `≈ ${balance?.formattedUsd ?? '0.00'} USD`
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Funding Only Card - Only show if locked balance > 0 */}
                    {lockedBalance && lockedBalance.raw > 0 && (
                      <div className="w-full sm:!w-auto sm:!flex-1 bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <span className="text-sm font-medium text-gray-700">Funding Only</span>
                          <Tooltip
                            content={
                              <div className="space-y-2">
                                <div className="font-semibold text-gray-900">Funding Only</div>
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
                              className="text-gray-400 hover:text-gray-600 cursor-help"
                            />
                          </Tooltip>
                        </div>
                        <div className="mt-2">
                          <div
                            className="text-2xl sm:!text-3xl font-semibold text-gray-900 truncate"
                            title={showUSD ? lockedBalance.formattedUsd : lockedBalance.formatted}
                          >
                            {showUSD ? (
                              `${lockedBalance.formattedUsd || '$0.00 USD'}`
                            ) : (
                              <span className="flex items-center gap-2">
                                <ResearchCoinIcon size={24} />
                                {`${lockedBalance.formatted || '0.00'} RSC`}
                              </span>
                            )}
                          </div>
                          <div
                            className="text-sm sm:!text-lg text-gray-600 mt-1 truncate"
                            title={
                              showUSD
                                ? `${lockedBalance.formatted ?? '0.00'} RSC`
                                : lockedBalance.formattedUsd
                            }
                          >
                            {showUSD ? (
                              <span className="flex items-center gap-1">
                                ≈ <ResearchCoinIcon size={12} className="inline" />
                                {`${lockedBalance.formatted ?? '0.00'} RSC`}
                              </span>
                            ) : (
                              `≈ ${lockedBalance.formattedUsd ?? '$0.00 USD'}`
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {isConnected ? (
                  <>
                    <div className="flex items-center gap-4">
                      <Button
                        onClick={() => setIsBuyModalOpen(true)}
                        variant="default"
                        size="lg"
                        className="gap-2 px-3 sm:!px-4"
                      >
                        <Plus className="h-5 w-5" />
                        <span className="hidden sm:!inline-block sm:!flex-shrink-0">Buy RSC</span>
                      </Button>
                      <Button
                        onClick={() => setIsSellModalOpen(true)}
                        variant="default"
                        size="lg"
                        className="gap-2 px-3 sm:!px-4"
                      >
                        <Minus className="h-5 w-5" />
                        <span className="hidden sm:!inline-block sm:!flex-shrink-0">Sell RSC</span>
                      </Button>
                      <Button
                        onClick={() => setIsDepositModalOpen(true)}
                        variant="outlined"
                        size="lg"
                        className="gap-2 px-3 sm:!px-4"
                        disabled={!isBalanceReady}
                        data-action="deposit"
                      >
                        <ArrowDownToLine className="h-5 w-5" />
                        <span className="hidden sm:!inline-block sm:!flex-shrink-0">Deposit</span>
                      </Button>
                      <Button
                        onClick={() => setIsWithdrawModalOpen(true)}
                        variant="outlined"
                        size="lg"
                        className="gap-2 px-3 sm:!px-4"
                        disabled={!isBalanceReady}
                      >
                        <ArrowUpFromLine className="h-5 w-5" />
                        <span className="hidden sm:!inline-block sm:!flex-shrink-0">Withdraw</span>
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
