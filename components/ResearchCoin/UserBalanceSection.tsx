'use client';

import { ArrowDownToLine, ArrowUpFromLine, Plus, Minus, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { BuyModal } from '@/components/modals/ResearchCoin/BuyModal';
import { SellModal } from '@/components/modals/ResearchCoin/SellModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useAccount } from 'wagmi';
import { Tooltip } from '@/components/ui/Tooltip';
import { FundingCreditsTooltip } from '@/components/ui/FundingCreditsTooltip';
import { formatCombinedBalance, formatCombinedBalanceSecondary } from '@/utils/number';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { Button } from '@/components/ui/Button';

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
  const { showUSD, toggleCurrency } = useCurrencyPreference();

  // Only consider balance as not ready if we're fetching exchange rate
  // Zero balance (balance = 0) should be treated as a valid state
  const isBalanceReady = !isFetchingExchangeRate;

  return (
    <>
      <div className="mb-6 mx-auto w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Balance Overview Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-gray-500 text-sm font-medium">Balance Overview</h2>
                <select
                  value={showUSD ? 'USD' : 'RSC'}
                  onChange={() => toggleCurrency()}
                  className="text-xs px-2 py-1 border border-gray-200 rounded-md bg-white text-gray-700 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                >
                  <option value="RSC">RSC</option>
                  <option value="USD">USD</option>
                </select>
              </div>

              {!isBalanceReady ? (
                // Loading state
                <div>
                  <div className="h-10 w-48 bg-gray-100 animate-pulse rounded mb-2" />
                  <div className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-gray-100 animate-pulse rounded-full" />
                    <div className="h-5 w-24 bg-gray-100 animate-pulse rounded" />
                  </div>
                </div>
              ) : (
                // Total balance display (available + funding credits)
                <div>
                  <div className="text-4xl font-bold text-gray-900">
                    {formatCombinedBalance({ balance, lockedBalance, showUSD })}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-gray-600 text-sm">
                      {formatCombinedBalanceSecondary({ balance, lockedBalance, showUSD })}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Balance breakdown section with vertical divider */}
            {!isBalanceReady ? (
              <div className="bg-gray-50 rounded-lg p-4 flex">
                {/* Loading skeleton */}
                <div className="flex-1">
                  <div className="h-4 w-28 bg-gray-200 animate-pulse rounded mb-3" />
                  <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-1" />
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="w-px bg-gray-200 mx-6" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="h-4 w-24 bg-gray-200 animate-pulse rounded" />
                    <div className="h-5 w-20 bg-gray-200 animate-pulse rounded-full" />
                  </div>
                  <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-1" />
                  <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4 flex">
                {/* Available Balance */}
                <div className="flex-1">
                  <div className="text-gray-600 text-sm font-medium mb-2">Available Balance</div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {showUSD ? balance?.formattedUsd || '$0.00' : balance?.formatted || '0.00 RSC'}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {showUSD
                      ? balance?.formatted || '0.00 RSC'
                      : balance?.formattedUsd || '$0.00 USD'}
                  </div>
                </div>

                {/* Vertical divider */}
                <div className="w-px bg-gray-200 mx-6" />

                {/* Funding Credits */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gray-600 text-sm font-medium">Funding Credits</span>
                    <Tooltip content={<FundingCreditsTooltip />} position="top" width="w-fit">
                      <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
                    </Tooltip>
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {showUSD
                      ? lockedBalance?.formattedUsd || '$0.00'
                      : lockedBalance?.formatted || '0.00 RSC'}
                  </div>
                  <div className="text-gray-500 text-sm">
                    {showUSD
                      ? lockedBalance?.formatted || '0.00 RSC'
                      : lockedBalance?.formattedUsd || '$0.00 USD'}
                  </div>
                </div>
              </div>
            )}

            {/* Wallet connection section for non-connected users */}
            {!isConnected && (
              <>
                <div className="pt-2">
                  <p className="text-gray-600 text-base mb-4">
                    To buy, sell, deposit or withdraw RSC, start by connecting your wallet.
                  </p>
                  <WalletDefault />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons for connected users - moved outside the white box */}
        {isConnected && (
          <div className="mt-6 grid grid-cols-4 gap-3">
            <Button
              onClick={() => setIsBuyModalOpen(true)}
              variant="outlined"
              className="flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Plus className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Buy RSC</span>
            </Button>
            <Button
              onClick={() => setIsSellModalOpen(true)}
              variant="outlined"
              className="flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Minus className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Sell RSC</span>
            </Button>
            <Button
              onClick={() => setIsDepositModalOpen(true)}
              variant="outlined"
              disabled={!isBalanceReady}
              data-action="deposit"
              className="flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ArrowDownToLine className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Deposit</span>
            </Button>
            <Button
              onClick={() => setIsWithdrawModalOpen(true)}
              variant="outlined"
              disabled={!isBalanceReady}
              className="flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ArrowUpFromLine className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Withdraw</span>
            </Button>
            <WalletDefault />
          </div>
        )}
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
