'use client';

import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { StickyActionBar } from '@/components/work/StickyActionBar';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { useFundraiseSummary } from '@/components/Fund/lib/useFundraiseSummary';
import type { Fundraise } from '@/types/funding';

/**
 * Fund, for the proposal page wherever its funding card is hidden, beside how
 * far the fundraise has come: raised of the goal, a thin bar, the funders and
 * the time left.
 */
export function ProposalActionBar({ fundraise }: { fundraise: Fundraise }) {
  const summary = useFundraiseSummary(fundraise);
  const { openFundPanel } = useFundPanel();

  if (!summary.isActive) return null;

  const funders = `${summary.funderCount} ${summary.funderCount === 1 ? 'funder' : 'funders'}`;

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
          {summary.timeLeft ? `${funders} · ${summary.timeLeft}` : funders}
        </p>
      </div>
      <Button variant="default" size="lg" onClick={openFundPanel} className="gap-2 px-6">
        <Coins className="h-4 w-4" />
        Fund
      </Button>
    </StickyActionBar>
  );
}
