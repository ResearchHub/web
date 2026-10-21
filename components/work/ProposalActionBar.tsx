'use client';

import { StickyActionBar } from '@/components/work/StickyActionBar';
import { FundButton } from '@/components/Funding/FundButton';
import { useFundraiseSummary } from '@/components/Fund/lib/useFundraiseSummary';
import type { Fundraise } from '@/types/funding';

/**
 * Fund, for the proposal page wherever its funding card is hidden, beside how
 * far the fundraise has come: raised of the goal, a thin bar, the funders and
 * the time left.
 */
export function ProposalActionBar({ fundraise }: { fundraise: Fundraise }) {
  const summary = useFundraiseSummary(fundraise);

  if (!summary.isActive) return null;

  return (
    <StickyActionBar>
      <div className="min-w-0 flex-1">
        <p className="flex items-baseline gap-1.5 whitespace-nowrap">
          <span className="font-mono text-[17px] font-semibold text-green-700">
            {summary.raised}
          </span>
          <span className="truncate text-[13px] text-gray-500">of {summary.goal}</span>
        </p>
        <div className="mt-1.5 h-1 w-full max-w-[150px] overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${summary.barPercent}%` }}
          />
        </div>
        <p className="mt-1 truncate text-xs text-gray-500">
          {summary.timeLeft ? `${summary.fundersText} · ${summary.timeLeft}` : summary.fundersText}
        </p>
      </div>
      <FundButton size="lg" className="px-6">
        Fund
      </FundButton>
    </StickyActionBar>
  );
}
