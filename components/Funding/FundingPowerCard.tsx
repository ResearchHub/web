'use client';

import { ArrowRight, Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FundingPowerTooltip } from '@/components/tooltips/FundingPowerTooltip';
import { useFundingPowerControls } from '@/contexts/FundingPowerContext';
import { useFundingPower } from '@/hooks/useFundingPower';
import { cn } from '@/utils/styles';

interface FundingPowerCardProps {
  className?: string;
}

/**
 * Raised white panel that sits above the gray sidebar rail rather than inside
 * it, so it reads as the primary thing in the column instead of another block
 * of gray text.
 */
const CARD_SURFACE = 'rounded-lg border border-gray-200 bg-white p-4 shadow-sm';

/**
 * Wallet card for the Activity sidebar. Leads with total funding power and a
 * deposit action; the per-asset breakdown lives in the tooltip so the card can
 * stay focused on how much is available and how it can be spent.
 */
export const FundingPowerCard = ({ className }: FundingPowerCardProps) => {
  const { isAmountHidden, toggleAmountHidden, isPrivacyReady, openAddFunds } =
    useFundingPowerControls();
  const { isReady, isEmpty, isSignedIn, total, rscBalance, fundingCredits, format } =
    useFundingPower();

  if (!isReady) {
    return <FundingPowerCardSkeleton className={className} />;
  }

  return (
    <aside className={cn(CARD_SURFACE, 'w-[250px]', className)}>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">Funding power</p>

      <div className="mt-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAmountHidden}
          aria-label={isAmountHidden ? 'Show funding power' : 'Hide funding power'}
          className={cn(
            'font-mono text-3xl font-bold leading-none tracking-tight',
            isSignedIn && isEmpty ? 'text-gray-300' : 'text-gray-900',
            !isPrivacyReady && 'invisible'
          )}
        >
          {!isSignedIn ? '$0.00' : isAmountHidden ? '••••' : format(total)}
        </button>
        {isSignedIn && (
          <FundingPowerTooltip
            rscBalance={format(rscBalance)}
            fundingCredits={format(fundingCredits)}
          />
        )}
      </div>

      {/* Two-line so the subtitle can carry the methods, which is the whole
          reason to open it — "Deposit" alone read as RSC-only. */}
      <Button
        onClick={openAddFunds}
        className="mt-3.5 h-auto w-full justify-start gap-2 px-3 py-2 text-left"
      >
        <Coins size={16} className="shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-semibold leading-tight">Add funds</span>
          <span className="block text-[11px] font-normal leading-tight text-white/80">
            Cash, crypto, or DAF assets
          </span>
        </span>
        <ArrowRight size={14} className="shrink-0" />
      </Button>
    </aside>
  );
};

const FundingPowerCardSkeleton = ({ className }: { className?: string }) => (
  <aside className={cn(CARD_SURFACE, 'w-[250px] animate-pulse', className)} aria-hidden>
    <div className="flex items-center gap-1.5">
      <div className="h-4 w-4 shrink-0 rounded bg-gray-200" />
      <div className="h-4 w-28 rounded bg-gray-200" />
    </div>
    <div className="mt-3.5 flex items-center gap-2">
      <div className="h-8 w-28 rounded bg-gray-200" />
      <div className="h-4 w-4 rounded bg-gray-200" />
    </div>
    <div className="mt-3.5 h-[43px] w-full rounded-lg bg-gray-200" />
  </aside>
);
