'use client';

import { ArrowDownToLine, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FundingPowerTooltip } from '@/components/tooltips/FundingPowerTooltip';
import { useFundingPowerControls } from '@/contexts/FundingPowerContext';
import { useFundingPower } from '@/hooks/useFundingPower';
import { cn } from '@/utils/styles';

/**
 * Only exists below the right sidebar's breakpoint. At `lg` and up the sidebar
 * card holds the balance instead, so the two never show together.
 */
const BAR_VISIBILITY = 'lg:hidden';
const BAR_SURFACE =
  'flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3.5 py-3 shadow-sm';

interface FundingPowerBarProps {
  className?: string;
}

/**
 * Compact version of FundingPowerCard for screens too narrow for the right
 * sidebar, where the card has no column to live in. Stacks the total under
 * the title so the amount still leads, and keeps Deposit as a sibling action
 * sized to that two-line cluster.
 */
export const FundingPowerBar = ({ className }: FundingPowerBarProps) => {
  const { isAmountHidden, toggleAmountHidden, isPrivacyReady, openDeposit } =
    useFundingPowerControls();
  const { isReady, isEmpty, total, rscBalance, fundingCredits, format } = useFundingPower();

  return (
    <div className={cn(BAR_VISIBILITY, className)}>
      {isReady ? (
        <div className={BAR_SURFACE}>
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
              <Zap className="h-4 w-4 shrink-0" />
              Funding power
            </p>
            <div className="mt-1.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={toggleAmountHidden}
                aria-label={isAmountHidden ? 'Show funding power' : 'Hide funding power'}
                className={cn(
                  'font-mono text-2xl font-bold leading-none tracking-tight',
                  isEmpty ? 'text-gray-300' : 'text-gray-900',
                  !isPrivacyReady && 'invisible'
                )}
              >
                {isEmpty ? '—' : isAmountHidden ? '••••' : format(total)}
              </button>
              <FundingPowerTooltip
                rscBalance={format(rscBalance)}
                fundingCredits={format(fundingCredits)}
              />
            </div>
          </div>

          <Button size="md" onClick={openDeposit} className="h-10 shrink-0 gap-1.5 px-4">
            <ArrowDownToLine size={16} className="shrink-0" />
            Deposit
          </Button>
        </div>
      ) : (
        <div className={cn(BAR_SURFACE, 'animate-pulse')} aria-hidden>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <div className="h-4 w-4 shrink-0 rounded bg-gray-200" />
              <div className="h-4 w-28 rounded bg-gray-200" />
            </div>
            <div className="mt-1.5 flex items-center gap-1.5">
              <div className="h-7 w-20 rounded bg-gray-200" />
              <div className="h-4 w-4 rounded bg-gray-200" />
            </div>
          </div>
          <div className="h-10 w-[5.5rem] shrink-0 rounded-lg bg-gray-200" />
        </div>
      )}
    </div>
  );
};
