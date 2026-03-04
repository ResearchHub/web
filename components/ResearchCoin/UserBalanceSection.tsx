'use client';

import { ArrowDownToLine, ArrowUpFromLine, DollarSign, HelpCircle } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { FundButton } from '@coinbase/onchainkit/fund';
import { DepositModal } from '../modals/ResearchCoin/DepositModal';
import { WithdrawModal } from '../modals/ResearchCoin/WithdrawModal';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { FundingCreditsTooltip } from '@/components/ui/FundingCreditsTooltip';
import { formatCombinedBalance, formatCombinedBalanceSecondary } from '@/utils/number';
import { Button } from '@/components/ui/Button';
import { CoinbaseService } from '@/services/coinbase.service';

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
  const [onrampUrl, setOnrampUrl] = useState<string | null>(null);

  const { showUSD } = useCurrencyPreference();

  // Only consider balance as not ready if we're fetching exchange rate
  // Zero balance (balance = 0) should be treated as a valid state
  const isBalanceReady = !isFetchingExchangeRate;

  const fetchOnrampUrl = useCallback(async () => {
    try {
      const response = await CoinbaseService.createRSCOnrampUrl();
      setOnrampUrl(response.onramp_url);
    } catch (err) {
      console.error('Failed to fetch onramp URL:', err);
    }
  }, []);

  // Pre-fetch the onramp URL on mount
  useEffect(() => {
    fetchOnrampUrl();
  }, [fetchOnrampUrl]);

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
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-6 grid grid-cols-3 gap-3">
          {onrampUrl ? (
            <FundButton
              fundingUrl={onrampUrl}
              openIn="popup"
              className="w-full flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl border border-gray-200 bg-white shadow-sm hover:shadow-md active:scale-[0.98] transition-all duration-200 group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                <DollarSign className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Buy</span>
            </FundButton>
          ) : (
            <Button
              variant="outlined"
              disabled
              className="flex flex-col items-center gap-2 h-auto py-3 px-4 rounded-xl shadow-sm"
            >
              <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-gray-700" strokeWidth={2} />
              </div>
              <span className="text-sm font-medium text-gray-900">Buy</span>
            </Button>
          )}
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
        </div>
      </div>

      {/* Modals */}
      {isBalanceReady && (
        <>
          <DepositModal isOpen={isDepositModalOpen} onClose={() => setIsDepositModalOpen(false)} />
          <WithdrawModal
            isOpen={isWithdrawModalOpen}
            onClose={() => setIsWithdrawModalOpen(false)}
            availableBalance={balance?.raw || 0}
            onSuccess={onTransactionSuccess}
          />
        </>
      )}
    </>
  );
}
