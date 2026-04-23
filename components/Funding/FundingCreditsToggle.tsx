'use client';

import { HelpCircle } from 'lucide-react';
import { Switch } from '@/components/ui/Switch';
import { Tooltip } from '@/components/ui/Tooltip';
import { FundingCreditsTooltip } from '@/components/ui/FundingCreditsTooltip';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';

interface FundingCreditsToggleProps {
  /** User's locked RSC balance (earned funding credits) */
  lockedBalance: number;
  /** Contribution amount in USD — used to compute the applied amount when toggled on */
  contributionAmountUsd: number;
  /** Whether credits should be applied to this contribution */
  checked: boolean;
  /** Toggle handler */
  onCheckedChange: (checked: boolean) => void;
}

export function FundingCreditsToggle({
  lockedBalance,
  contributionAmountUsd,
  checked,
  onCheckedChange,
}: FundingCreditsToggleProps) {
  const { exchangeRate } = useExchangeRate();
  const lockedBalanceUsd = exchangeRate ? lockedBalance * exchangeRate : 0;
  // Backend is the source of truth; this mirrors its cap for display.
  const appliedUsd = Math.min(lockedBalanceUsd, contributionAmountUsd);

  const formatUsd = (amount: number) =>
    `$${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-gray-900">Use funding credits</span>
        <Tooltip content={<FundingCreditsTooltip />} width="w-[280px]">
          <HelpCircle className="h-4 w-4 text-gray-400 hover:text-gray-600 cursor-help transition-colors" />
        </Tooltip>
      </div>
      <div className="flex items-center gap-3">
        <Switch checked={checked} onCheckedChange={onCheckedChange} />
        <div className="flex flex-col min-w-0 text-sm">
          <span className="text-gray-900">
            {checked ? (
              <>
                <span className="font-semibold">{formatUsd(appliedUsd)}</span> applied
              </>
            ) : (
              <>
                Apply <span className="font-semibold">{formatUsd(appliedUsd)}</span> in funding
                credits
              </>
            )}
          </span>
          <span className="text-xs text-gray-500">{formatUsd(lockedBalanceUsd)} available</span>
        </div>
      </div>
    </div>
  );
}
