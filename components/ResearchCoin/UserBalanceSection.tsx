'use client';

import { ArrowDownToLine, ArrowUpFromLine, Plus, Minus, HelpCircle } from 'lucide-react';
import { useState } from 'react';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { BuyModal } from '@/components/modals/ResearchCoin/BuyModal';
import { SellModal } from '@/components/modals/ResearchCoin/SellModal';
import { Button } from '@/components/ui/Button';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useAccount } from 'wagmi';
import { Tooltip } from '@/components/ui/Tooltip';
import { FundingCreditsTooltip } from '@/components/ui/FundingCreditsTooltip';
import {
  formatRSC,
  formatUsdValue,
  formatCombinedBalance,
  formatCombinedBalanceSecondary,
  extractExchangeRate,
} from '@/utils/number';

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
        <div className="bg-white rounded-xl border border-gray-200 p-6">
          <div className="space-y-6">
            {/* Balance Overview Section */}
            <div>
              <h2 className="text-gray-500 text-sm font-medium mb-3">Balance Overview</h2>

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
                  <Button
                    onClick={() => {
                      const walletButton = document.querySelector(
                        '[data-testid="ockConnectWallet_Container"]'
                      );
                      if (walletButton instanceof HTMLElement) {
                        walletButton.click();
                      }
                    }}
                    variant="default"
                    size="lg"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 text-base font-medium"
                  >
                    Connect Wallet
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Action buttons for connected users - moved outside the white box */}
        {isConnected && (
          <div className="mt-6 grid grid-cols-4 gap-3">
            <button
              onClick={() => setIsBuyModalOpen(true)}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Plus className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Buy RSC</span>
            </button>
            <button
              onClick={() => setIsSellModalOpen(true)}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <Minus className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Sell RSC</span>
            </button>
            <button
              onClick={() => setIsDepositModalOpen(true)}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              disabled={!isBalanceReady}
              data-action="deposit"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ArrowDownToLine className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Deposit</span>
            </button>
            <button
              onClick={() => setIsWithdrawModalOpen(true)}
              className="flex flex-col items-center gap-2 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 active:scale-[0.98] transition-all duration-200 group disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-sm"
              disabled={!isBalanceReady}
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <ArrowUpFromLine className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Withdraw</span>
            </button>
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
