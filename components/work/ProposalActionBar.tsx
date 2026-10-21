'use client';

import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { FundButton } from '@/components/Funding/FundButton';
import { FundedConfetti } from '@/components/Funding/FundedConfetti';
import { useFundraiseSummary } from '@/components/Funding/lib/useFundraiseSummary';
import type { Fundraise } from '@/types/funding';

/**
 * Fund, for the proposal page wherever its funding card is hidden: a bar as
 * wide as the page for how far the fundraise has come, then raised of the
 * goal, the funders and the time left beside the button. Once the fundraise
 * ends the bar stays, with Fund grayed out. Fully funded, it bursts with
 * confetti a second after the page loads, as the sidebar's card does where
 * that shows instead.
 */
export function ProposalActionBar({ fundraise }: { fundraise: Fundraise }) {
  const summary = useFundraiseSummary(fundraise);

  return (
    <StickyActionBar>
      {/* The bar is sticky, so the confetti fills it. */}
      {summary.isCompleted && <FundedConfetti />}
      <div className="min-w-0 flex-1">
        <div
          role="img"
          aria-label={`${summary.percent}% of the goal raised`}
          className="h-1.5 overflow-hidden rounded-full bg-gray-200"
        >
          <div
            className="h-full rounded-full bg-emerald-500"
            style={{ width: `${summary.barPercent}%` }}
          />
        </div>
        <div className="mt-2.5 flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="flex items-baseline gap-1.5 whitespace-nowrap">
              <span className="font-mono text-lg font-semibold text-green-700">
                {summary.raised}
              </span>
              <span className="truncate text-[13px] text-gray-500">
                of {summary.goal} · {summary.percent}%
              </span>
            </p>
            <p suppressHydrationWarning className="mt-0.5 truncate text-[12.5px] text-gray-500">
              {summary.timeLeft
                ? `${summary.fundersText} · ${summary.timeLeft}`
                : summary.fundersText}
            </p>
          </div>
          <FundButton size="lg" className="px-6" unavailableReason={summary.fundUnavailableReason}>
            Fund
          </FundButton>
        </div>
      </div>
    </StickyActionBar>
  );
}
