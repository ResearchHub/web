'use client';

import { useState } from 'react';
import { ArrowDownToLine, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { FundingPowerTooltip } from '@/components/tooltips/FundingPowerTooltip';
import { FundingMethodsModal } from './FundingMethodsModal';
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
  const [isMethodsModalOpen, setIsMethodsModalOpen] = useState(false);
  const { isAmountHidden, toggleAmountHidden, isPrivacyReady, openDeposit } =
    useFundingPowerControls();
  const { isReady, isEmpty, total, rscBalance, fundingCredits, format } = useFundingPower();

  if (!isReady) {
    return <FundingPowerCardSkeleton className={className} />;
  }

  return (
    <aside className={cn(CARD_SURFACE, 'w-[250px]', className)}>
      <p className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
        <Zap className="h-4 w-4 shrink-0" />
        Funding power
      </p>

      <div className="mt-3.5 flex items-center gap-2">
        <button
          type="button"
          onClick={toggleAmountHidden}
          aria-label={isAmountHidden ? 'Show funding power' : 'Hide funding power'}
          className={cn(
            'font-mono text-3xl font-bold leading-none tracking-tight',
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

      <Button size="sm" onClick={openDeposit} className="mt-3 w-full gap-1">
        <ArrowDownToLine size={14} className="shrink-0" />
        Deposit
      </Button>

      <div className="mt-3 flex items-center justify-between gap-2 text-[13px] leading-snug">
        <span className="text-gray-500">
          Fund with <span className="font-semibold text-gray-800">USD</span>,{' '}
          <span className="font-semibold text-gray-800">RSC</span>, or a{' '}
          <span className="font-semibold text-gray-800">DAF</span>
        </span>
        <button
          type="button"
          onClick={() => setIsMethodsModalOpen(true)}
          className="shrink-0 font-medium text-primary-600 hover:underline"
        >
          Learn more
        </button>
      </div>

      <FundingMethodsModal
        isOpen={isMethodsModalOpen}
        onClose={() => setIsMethodsModalOpen(false)}
      />
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
    <div className="mt-3 h-8 w-full rounded-lg bg-gray-200" />
    <div className="mt-3 h-3.5 w-48 rounded bg-gray-200" />
  </aside>
);
