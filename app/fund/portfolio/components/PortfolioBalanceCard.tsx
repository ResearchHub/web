'use client';

import { HelpCircle } from 'lucide-react';
import { useUser } from '@/contexts/UserContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { Tooltip } from '@/components/ui/Tooltip';
import { FundingCreditsTooltip } from '@/components/ui/FundingCreditsTooltip';
import { formatBalance } from '@/components/ResearchCoin/lib/types';
import { formatCombinedBalance, formatCombinedBalanceSecondary } from '@/utils/number';

interface BalanceDisplayProps {
  readonly label: string;
  readonly balance: ReturnType<typeof formatBalance>;
  readonly showUSD: boolean;
  readonly tooltip?: React.ReactNode;
}

function BalanceDisplay({ label, balance, showUSD, tooltip }: BalanceDisplayProps) {
  const primary = showUSD ? balance.formattedUsd : `${balance.formatted} RSC`;
  const secondary = showUSD ? `${balance.formatted} RSC` : balance.formattedUsd;

  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-gray-600 text-sm font-medium">{label}</span>
        {tooltip && (
          <Tooltip content={tooltip} position="top" width="w-fit">
            <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
          </Tooltip>
        )}
      </div>
      <div className="text-lg sm:text-2xl font-semibold text-gray-900 break-all">{primary}</div>
      <div className="text-gray-500 text-sm">{secondary}</div>
    </div>
  );
}

function BalanceDisplaySkeleton() {
  return (
    <div className="flex-1">
      <div className="h-4 w-28 bg-gray-200 animate-pulse rounded mb-3" />
      <div className="h-7 w-32 bg-gray-200 animate-pulse rounded mb-1" />
      <div className="h-4 w-20 bg-gray-200 animate-pulse rounded" />
    </div>
  );
}

export function PortfolioBalanceCard() {
  const { user } = useUser();
  const { exchangeRate, isLoading: isFetchingExchangeRate } = useExchangeRate();
  const { showUSD } = useCurrencyPreference();

  const balance = formatBalance(user?.balance || 0, exchangeRate);
  const lockedBalance = formatBalance(user?.lockedBalance || 0, exchangeRate);
  const isReady = !isFetchingExchangeRate;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div>
        <h3 className="text-gray-500 text-sm font-medium mb-2">Total Funding Balance</h3>
        {isReady ? (
          <>
            <div className="text-2xl sm:text-4xl font-bold text-gray-900 break-all">
              {formatCombinedBalance({ balance, lockedBalance, showUSD })}
            </div>
            <div className="text-gray-500 text-sm mt-1">
              {formatCombinedBalanceSecondary({ balance, lockedBalance, showUSD })}
            </div>
          </>
        ) : (
          <>
            <div className="h-10 w-48 bg-gray-100 animate-pulse rounded mb-2" />
            <div className="h-5 w-24 bg-gray-100 animate-pulse rounded" />
          </>
        )}
      </div>

      <div className="bg-gray-50 rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row gap-4 sm:gap-0">
        {isReady ? (
          <>
            <BalanceDisplay label="Available Balance" balance={balance} showUSD={showUSD} />
            <div className="h-px sm:h-auto sm:w-px bg-gray-200 sm:mx-6" />
            <BalanceDisplay
              label="Funding Credits"
              balance={lockedBalance}
              showUSD={showUSD}
              tooltip={<FundingCreditsTooltip />}
            />
          </>
        ) : (
          <>
            <BalanceDisplaySkeleton />
            <div className="h-px sm:h-auto sm:w-px bg-gray-200 sm:mx-6" />
            <BalanceDisplaySkeleton />
          </>
        )}
      </div>
    </div>
  );
}
