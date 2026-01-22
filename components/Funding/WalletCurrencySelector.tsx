'use client';

import { useState } from 'react';
import { DollarSign, ChevronDown, Plus } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';
import { cn } from '@/utils/styles';
import type { ContributionCurrency } from './CurrencyRadioGroup';

interface WalletCurrencySelectorProps {
  /** The currently selected currency */
  selectedCurrency: ContributionCurrency;
  /** Callback when currency is selected */
  onCurrencyChange: (currency: ContributionCurrency) => void;
  /** RSC balance amount */
  rscBalance: number;
  /** USD balance in cents */
  usdCents: number;
  /** RSC balance in USD cents (for display and total calculation) */
  rscBalanceUsdCents?: number;
  /** When true, shows fee badges on options */
  showLowestFeesBadge?: boolean;
  /** Callback when user clicks "Add funds" */
  onAddFunds?: () => void;
  className?: string;
}

/**
 * Wallet-style currency selector with collapsible options.
 * Shows a "Fund with" line that expands to reveal currency choices.
 */
export function WalletCurrencySelector({
  selectedCurrency,
  onCurrencyChange,
  rscBalance,
  usdCents,
  rscBalanceUsdCents,
  onAddFunds,
  className,
}: WalletCurrencySelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatUsdFromCents = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const handleCurrencySelect = (currency: ContributionCurrency) => {
    onCurrencyChange(currency);
    setIsExpanded(false);
  };

  // Calculate total dynamically: USD balance + RSC value in USD
  const rscValueInUsdCents = rscBalanceUsdCents ?? 0;
  const displayTotal = usdCents + rscValueInUsdCents;

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-gray-50 overflow-hidden', className)}>
      {/* Collapsed "Fund with" row */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 group"
      >
        <span className="text-gray-700 font-medium">Fund with</span>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-gray-200 hover:bg-gray-50 transition-colors">
          {selectedCurrency === 'RSC' ? (
            <>
              <ResearchCoinIcon size={18} />
              <span className="font-medium text-gray-900">ResearchCoin</span>
            </>
          ) : (
            <>
              <div className="w-[18px] h-[18px] rounded-full bg-green-100 flex items-center justify-center">
                <DollarSign className="h-3 w-3 text-green-600" />
              </div>
              <span className="font-medium text-gray-900">Cash</span>
            </>
          )}
          <ChevronDown
            className={cn(
              'h-4 w-4 text-gray-500 transition-transform duration-200',
              isExpanded && 'rotate-180'
            )}
          />
        </div>
      </button>

      {/* Expanded options with animation */}
      <div
        className={cn(
          'grid transition-all duration-200 ease-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="px-4 pb-4 space-y-1">
            {/* Total Balance */}
            <div className="py-2 mb-2">
              <div className="text-xs text-gray-500">Total Balance</div>
              <div className="text-lg font-bold text-gray-900">
                {formatUsdFromCents(displayTotal)}
              </div>
            </div>

            {/* Cash/USD Option */}
            <button
              type="button"
              onClick={() => handleCurrencySelect('USD')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all',
                selectedCurrency === 'USD'
                  ? 'bg-primary-50 border-2 border-primary-500 shadow-sm'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">Cash</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-yellow-100 text-yellow-700">
                      12% fee
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">USD</div>
                </div>
              </div>
              <div className="font-medium text-gray-900">{formatUsdFromCents(usdCents)}</div>
            </button>

            {/* ResearchCoin/RSC Option */}
            <button
              type="button"
              onClick={() => handleCurrencySelect('RSC')}
              className={cn(
                'w-full flex items-center justify-between px-3 py-3 rounded-lg transition-all',
                selectedCurrency === 'RSC'
                  ? 'bg-primary-50 border-2 border-primary-500 shadow-sm'
                  : 'bg-white border-2 border-transparent hover:bg-gray-50'
              )}
            >
              <div className="flex items-center gap-3">
                <ResearchCoinIcon size={40} />
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">ResearchCoin</span>
                    <span className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-yellow-100 text-yellow-700">
                      9% fee
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">RSC</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {rscBalanceUsdCents
                    ? formatUsdFromCents(rscBalanceUsdCents)
                    : formatRSC({ amount: rscBalance })}
                </div>
                {rscBalanceUsdCents && (
                  <div className="text-xs text-gray-500">
                    {formatRSC({ amount: rscBalance })} RSC
                  </div>
                )}
              </div>
            </button>

            {/* Add Funds Option */}
            {onAddFunds && (
              <button
                type="button"
                onClick={() => {
                  setIsExpanded(false);
                  onAddFunds();
                }}
                className="w-full flex items-center justify-center gap-2 px-3 py-2.5 mt-2 rounded-lg border border-dashed border-gray-300 text-primary-600 hover:border-primary-300 hover:bg-primary-50/50 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span className="text-sm font-medium">Add funds</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
