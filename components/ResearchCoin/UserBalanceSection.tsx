'use client';

import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useState } from 'react';
import { DepositOptionsModal } from '../modals/ResearchCoin/DepositOptionsModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { BuyModal } from '@/components/modals/ResearchCoin/BuyModal';
import { SellModal } from '@/components/modals/ResearchCoin/SellModal';
import { useAccount } from 'wagmi';
import { WalletDefault } from '@coinbase/onchainkit/wallet';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';

interface UserBalanceSectionProps {
  balance: {
    formatted: string;
    formattedUsd: string;
    raw: number;
  } | null;
  // Balance fields
  rscBalance?: number;
  isFetchingExchangeRate: boolean;
  onTransactionSuccess?: () => void;
  // Deprecated - kept for backwards compatibility but no longer used in UI
  lockedBalance?: {
    formatted: string;
    formattedUsd: string;
    raw: number;
  } | null;
}

export function UserBalanceSection({
  balance,
  rscBalance,
  isFetchingExchangeRate,
  onTransactionSuccess,
}: UserBalanceSectionProps) {
  const { exchangeRate } = useExchangeRate();
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);

  // Check if wallet is connected
  const { isConnected } = useAccount();

  // Only consider balance as not ready if we're fetching exchange rate
  const isBalanceReady = !isFetchingExchangeRate;

  // Format USD from cents
  const formatUsdFromCents = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Use RSC balance with fallback
  const displayRscBalance = rscBalance ?? balance?.raw ?? 0;

  // Calculate RSC value in USD cents
  const rscValueInUsdCents = exchangeRate ? Math.round(displayRscBalance * exchangeRate * 100) : 0;

  return (
    <>
      <div className="mb-6 mx-auto w-full">
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="space-y-4">
            {/* Header: Balance + Actions on left, Wallet on right */}
            <div className="flex items-start justify-between">
              {/* Balance + Text Actions */}
              <div>
                {!isBalanceReady ? (
                  <div className="h-8 w-32 bg-gray-100 animate-pulse rounded" />
                ) : (
                  <>
                    <div className="text-2xl font-bold text-gray-900">
                      {formatUsdFromCents(rscValueInUsdCents)}
                    </div>
                    <div className="text-sm text-gray-500">Total Balance</div>
                  </>
                )}

                {/* Text-only action buttons */}
                {isConnected && (
                  <div className="flex items-center gap-3 mt-2">
                    <button
                      onClick={() => setIsBuyModalOpen(true)}
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Buy
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      onClick={() => setIsSellModalOpen(true)}
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors"
                    >
                      Sell
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      onClick={() => setIsDepositModalOpen(true)}
                      disabled={!isBalanceReady}
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50"
                    >
                      Deposit
                    </button>
                    <span className="text-gray-300">·</span>
                    <button
                      onClick={() => setIsWithdrawModalOpen(true)}
                      disabled={!isBalanceReady}
                      className="text-sm font-medium text-primary-500 hover:text-primary-600 transition-colors disabled:opacity-50"
                    >
                      Withdraw
                    </button>
                  </div>
                )}
              </div>

              {/* Wallet */}
              <WalletDefault />
            </div>

            {/* Divider */}
            <div className="border-t border-gray-100" />

            {/* RSC Balance Row */}
            {!isBalanceReady ? (
              <div className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-200 animate-pulse rounded-full" />
                  <div className="h-5 w-20 bg-gray-200 animate-pulse rounded" />
                </div>
                <div className="h-5 w-24 bg-gray-200 animate-pulse rounded" />
              </div>
            ) : (
              <div className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <ResearchCoinIcon size={40} />
                  <div>
                    <div className="font-medium text-gray-900">ResearchCoin</div>
                    <div className="text-sm text-gray-500">RSC</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold text-gray-900">
                    {formatRSC({ amount: displayRscBalance })} RSC
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatUsdFromCents(rscValueInUsdCents)}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {isBalanceReady && (
        <>
          <DepositOptionsModal
            isOpen={isDepositModalOpen}
            onClose={() => setIsDepositModalOpen(false)}
            currentBalance={balance?.raw || 0}
            onSuccess={onTransactionSuccess}
            context="wallet"
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
