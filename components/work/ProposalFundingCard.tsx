'use client';

import { useState } from 'react';
import { Coins } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { ContributorModal } from '@/components/modals/ContributorModal';
import {
  BackerFaces,
  BackersTip,
  FundingBar,
  FundingCard,
  FundingTotal,
} from '@/components/Funding/FundingCard';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { useFundraiseSummary } from '@/components/Fund/lib/useFundraiseSummary';
import type { Fundraise } from '@/types/funding';

/**
 * A proposal's fundraise as the navy card at the top of its sidebar, in the
 * RFP pool card's style: what it has raised against its goal, the bar, whose
 * hover lists the funders, their faces, which open the full list, and Fund.
 */
export function ProposalFundingCard({ fundraise }: { fundraise: Fundraise }) {
  const summary = useFundraiseSummary(fundraise);
  const { openFundPanel } = useFundPanel();
  const [isFundersListOpen, setIsFundersListOpen] = useState(false);
  const funderNoun = summary.funderCount === 1 ? 'funder' : 'funders';
  const hasFunders = summary.funders.length > 0;

  return (
    <FundingCard
      label="Funding"
      status={summary.statusLabel}
      aside={summary.timeLeft && <span className="text-xs text-white/60">{summary.timeLeft}</span>}
      testId="proposal-funding"
    >
      <FundingTotal amount={summary.raised} goal={summary.goal} />

      <FundingBar
        label={`${summary.percent}% of the goal raised`}
        parts={[
          {
            percent: summary.barPercent,
            colorClassName: 'bg-emerald-400',
            tipWidth: 'w-64',
            tip: (
              <BackersTip
                heading={
                  <>
                    {summary.funderCount} {funderNoun} gave{' '}
                    <span className="font-mono">{summary.raised}</span>
                  </>
                }
                backers={summary.funders}
                total={summary.funderCount}
              />
            ),
          },
        ]}
      />

      <div className="mt-1 flex items-center justify-between gap-3 text-[13px]">
        {hasFunders ? (
          <button
            type="button"
            onClick={() => setIsFundersListOpen(true)}
            className="flex min-w-0 items-center gap-2 text-white/80 transition-colors hover:text-white"
          >
            <span className="truncate">
              {summary.funderCount} {funderNoun}
            </span>
            <BackerFaces backers={summary.funders} linked={false} />
          </button>
        ) : (
          <span className="truncate text-white/80">
            {summary.isActive ? 'Be the first funder' : 'No funders'}
          </span>
        )}
        <span className="font-mono font-semibold tabular-nums text-emerald-300">
          {summary.percent}%
        </span>
      </div>

      {summary.isActive && (
        <Button
          data-testid="proposal-fund"
          variant="default"
          onClick={openFundPanel}
          className="mt-4 w-full gap-2 font-semibold"
        >
          <Coins className="h-4 w-4" />
          Fund
        </Button>
      )}

      {hasFunders && (
        <ContributorModal
          isOpen={isFundersListOpen}
          onClose={() => setIsFundersListOpen(false)}
          contributors={fundraise.contributors.topContributors.map((contributor) => ({
            profile: contributor.authorProfile,
            amounts: contributor.totalContribution,
          }))}
          isCompleted={summary.isCompleted}
          rscToUsdRate={summary.rscToUsdRate}
        />
      )}
    </FundingCard>
  );
}
