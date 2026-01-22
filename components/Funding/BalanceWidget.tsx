'use client';

import { DollarSign } from 'lucide-react';
import { ResearchCoinIcon } from '@/components/ui/icons/ResearchCoinIcon';
import { formatRSC } from '@/utils/number';
import { cn } from '@/utils/styles';
import type { ContributionCurrency } from './CurrencyRadioGroup';

interface BalanceWidgetProps {
  /** The currency type to display balance for */
  currency: ContributionCurrency;
  /** RSC balance amount */
  rscBalance: number;
  /** USD balance in cents */
  usdCents: number;
  className?: string;
}

/**
 * Compact balance display widget for contribution modal.
 * Shows the available balance for the selected currency.
 */
export function BalanceWidget({ currency, rscBalance, usdCents, className }: BalanceWidgetProps) {
  const formatUsdFromCents = (cents: number) => {
    return `$${(cents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const displayBalance =
    currency === 'RSC' ? `${formatRSC({ amount: rscBalance })} RSC` : formatUsdFromCents(usdCents);

  return (
    <div
      className={cn(
        'flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3 border border-gray-200',
        className
      )}
    >
      <div className="flex items-center gap-2">
        {currency === 'RSC' ? (
          <ResearchCoinIcon size={18} />
        ) : (
          <div className="w-[18px] h-[18px] rounded-full bg-green-100 flex items-center justify-center">
            <DollarSign className="h-3 w-3 text-green-600" />
          </div>
        )}
        <span className="text-sm text-gray-600">Available</span>
      </div>
      <span className="text-sm font-semibold text-gray-900">{displayBalance}</span>
    </div>
  );
}
