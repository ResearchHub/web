'use client';

import { Coins, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FundingPowerTooltip } from '@/components/tooltips/FundingPowerTooltip';
import { useFundingPowerControls } from '@/contexts/FundingPowerContext';
import { useFundingPower } from '@/hooks/useFundingPower';
import { cn } from '@/utils/styles';

/**
 * Only exists below `tablet`, where it docks above the mobile bottom nav. From
 * 768px up the left sidebar carries funding power instead — the full card, or
 * the rail button on the compact rail — so the two never show together.
 */
const BAR_VISIBILITY = 'tablet:hidden';
const BAR_SURFACE =
  'flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm';

interface FundingPowerBarProps {
  className?: string;
}

/**
 * Compact version of FundingPowerCard for phones, where it is docked over the
 * content above the bottom nav. Everything sits on one line so the pair of
 * fixed bars stays as short as possible; the label truncates before the amount
 * or the action does, since those two carry the meaning.
 */
export const FundingPowerBar = ({ className }: FundingPowerBarProps) => {
  const { isAmountHidden, toggleAmountHidden, isPrivacyReady, openAddFunds } =
    useFundingPowerControls();
  const { isReady, isEmpty, isSignedIn, total, rscBalance, fundingCredits, format } =
    useFundingPower();

  return (
    <div className={cn(BAR_VISIBILITY, className)}>
      {isReady ? (
        // Hits are re-enabled here rather than on the wrapper (see
        // MobileBottomNav) so the gutters around the bar stay transparent to
        // touch. The loading state stays transparent throughout — it has
        // nothing to tap, so it may as well let scrolls through.
        <div className={cn(BAR_SURFACE, 'pointer-events-auto')}>
          <Zap className="h-4 w-4 shrink-0 text-gray-500" />
          <p className="min-w-0 truncate text-xs font-semibold text-gray-500">Funding power</p>

          <button
            type="button"
            onClick={toggleAmountHidden}
            aria-label={isAmountHidden ? 'Show funding power' : 'Hide funding power'}
            className={cn(
              'shrink-0 font-mono text-lg font-bold leading-none tracking-tight',
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

          <Button size="sm" onClick={openAddFunds} className="ml-auto shrink-0 gap-1.5">
            <Coins size={14} className="shrink-0" />
            Add funds
          </Button>
        </div>
      ) : (
        <div className={cn(BAR_SURFACE, 'animate-pulse')} aria-hidden>
          <div className="h-4 w-4 shrink-0 rounded bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
          <div className="h-5 w-16 shrink-0 rounded bg-gray-200" />
          <div className="ml-auto h-8 w-[6.5rem] shrink-0 rounded-lg bg-gray-200" />
        </div>
      )}
    </div>
  );
};
