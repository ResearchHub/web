'use client';

import { Trophy } from 'lucide-react';
import { StickyActionBar } from '@/components/ui/StickyActionBar';
import { FundButton } from '@/components/Funding/FundButton';
import { canAwardProposal, isAwardMechanism } from '@/components/Funding/lib/fundingMechanism';
import { useFundraiseSummary } from '@/components/Funding/lib/useFundraiseSummary';
import { useUser } from '@/contexts/UserContext';
import type { Fundraise } from '@/types/funding';
import type { LinkedGrant } from '@/types/work';

/**
 * Fund, for the proposal page wherever its funding card is hidden: a bar as
 * wide as the page for how far the fundraise has come, then raised of the
 * goal, the funders and the time left beside the button.
 */
export function ProposalActionBar({
  fundraise,
  linkedGrant,
}: {
  fundraise: Fundraise;
  linkedGrant?: LinkedGrant | null;
}) {
  const { user } = useUser();
  const summary = useFundraiseSummary(fundraise);
  const isAward = isAwardMechanism(linkedGrant?.fundingMechanism);

  if (isAward) {
    if (
      !canAwardProposal({
        userId: user?.id,
        grantCreatorUserId: linkedGrant?.createdByUserId,
        isAward,
        grantOpen: linkedGrant?.status === 'OPEN',
        fundraise,
      })
    ) {
      return null;
    }
    return (
      <StickyActionBar>
        <FundButton size="lg" icon={Trophy} className="w-full px-6">
          Award
        </FundButton>
      </StickyActionBar>
    );
  }

  if (!summary.isActive) return null;

  return (
    <StickyActionBar>
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
          <FundButton size="lg" className="px-6">
            Fund
          </FundButton>
        </div>
      </div>
    </StickyActionBar>
  );
}
