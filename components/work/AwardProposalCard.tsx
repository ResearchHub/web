'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check, PenLine, Trophy } from 'lucide-react';
import { FundButton } from '@/components/Funding/FundButton';
import { Button } from '@/components/ui/Button';
import { FundingCard } from '@/components/Funding/FundingCard';
import { formatFundingAmount } from '@/components/Funding/lib/fundingAmounts';
import {
  awardActionLabel,
  canAwardProposal,
  getAwardPhase,
} from '@/components/Funding/lib/fundingMechanism';
import { isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import { getLinkedGrantLink } from '@/components/work/lib/linkedGrant';
import { isWorkAuthor } from '@/components/work/lib/workAuthors';
import { useShowProposalTab } from '@/components/work/lib/workTabs';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { useUser } from '@/contexts/UserContext';
import type { Fundraise } from '@/types/funding';
import type { LinkedGrant, Work } from '@/types/work';
import { formatCurrency } from '@/utils/currency';
import { formatTimestamp } from '@/utils/date';
import { cn } from '@/utils/styles';

interface TimelineStep {
  readonly key: string;
  readonly label: string;
  /** When it happened, beside the label. */
  readonly date?: string;
  /** The line under the label: the RFP's name, a date, what is waited on. */
  readonly detail?: ReactNode;
  /** The detail stays on one line, cut short: the RFP's name can run long. */
  readonly truncate?: boolean;
  readonly done: boolean;
  /** It can no longer happen: the RFP closed or the proposal expired. */
  readonly disabled: boolean;
}

/**
 * A prize proposal's sidebar card. It shows the RFP's prize and that nobody
 * fundraises on the proposal. Once money is in, the amount is what it received
 * and Awarded is done, even while the payout is still waiting. Its last step
 * is the authors' updates. The button is whoever is looking's next move: an
 * author posts an update; the grant creator awards the prize while the RFP is
 * open and the proposal has not expired.
 */
export function AwardProposalCard({
  work,
  fundraise,
  linkedGrant,
  publishedDate,
  updatesCount = 0,
  latestUpdateDate,
}: {
  work: Work;
  fundraise: Fundraise;
  linkedGrant: LinkedGrant;
  publishedDate?: string;
  /** The authors' updates on the proposal, from the page's own fetch of them. */
  updatesCount?: number;
  latestUpdateDate?: string;
}) {
  const { user } = useUser();
  const showTab = useShowProposalTab(work);
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const phase = getAwardPhase(fundraise);
  // Money in escrow counts. The payout can still be waiting.
  const awarded = phase !== 'none';
  const grantOpen = linkedGrant.status === 'OPEN';
  const stillOpen = grantOpen && isFundraiseActive(fundraise);
  const canFund = canAwardProposal({
    userId: user?.id,
    grantCreatorUserId: linkedGrant.createdByUserId,
    isAward: true,
    grantOpen,
    fundraise,
  });
  const who = linkedGrant.organization.trim() || 'The funder';
  const headline =
    phase === 'none'
      ? formatCurrency({
          amount: linkedGrant.fundingAmount,
          showUSD,
          exchangeRate,
          skipConversion: showUSD,
        })
      : formatFundingAmount(fundraise.amountRaised, showUSD);
  const headlineLabel = awarded ? 'awarded' : 'prize';
  // An author who also opened the RFP is a candidate here: they post, not award.
  const isAuthor = isWorkAuthor(work.authors, user?.authorProfile?.id);
  const hasUpdates = updatesCount > 0;

  const rfp = getLinkedGrantLink({ linkedGrant } as Work);
  // The award is the funder's payment into the fundraise: its first
  // contribution dates it.
  const awardedDate = awarded ? firstContributionDate(fundraise) : undefined;

  const steps: TimelineStep[] = [
    {
      key: 'rfp',
      label: 'Applied to RFP',
      // Publishing the proposal is what submits it to the RFP.
      date: publishedDate,
      detail: rfp.title ? (
        rfp.href ? (
          <Link
            href={rfp.href}
            className="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/70"
          >
            {rfp.title}
          </Link>
        ) : (
          rfp.title
        )
      ) : undefined,
      truncate: true,
      done: true,
      disabled: false,
    },
    {
      key: 'awarded',
      label: 'Awarded',
      date: awardedDate,
      detail: awarded
        ? `${headline} from ${who}`
        : stillOpen
          ? `${who} picks who wins the prize once results are posted.`
          : 'The prize has closed',
      done: awarded,
      disabled: !awarded && !stillOpen,
    },
    {
      key: 'update',
      label: 'Update posted',
      date: hasUpdates ? latestUpdateDate : undefined,
      detail: hasUpdates ? (
        <button
          type="button"
          onClick={() => showTab('updates')}
          className="underline decoration-white/30 underline-offset-2 transition-colors hover:text-white hover:decoration-white/70"
        >
          {updatesCount === 1 ? '1 update' : `${updatesCount} updates`}
        </button>
      ) : isAuthor ? (
        'Share your progress and results.'
      ) : (
        'No updates yet'
      ),
      done: hasUpdates,
      disabled: false,
    },
  ];

  return (
    <FundingCard
      label="Competitor"
      aside={
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Prize</span>
        </span>
      }
      testId="proposal-award"
    >
      <p className="mt-2 flex items-baseline gap-2 leading-none">
        <span className="font-mono text-[30px] font-semibold tracking-tight tabular-nums">
          {headline}
        </span>
        <span className="text-sm text-white/60">{headlineLabel}</span>
      </p>
      <ol className="mt-4">
        {steps.map((step, index) => {
          // Every step still to come reads at full strength; only one that can
          // no longer happen fades.
          const isOpen = !step.done && !step.disabled;
          const isLast = index === steps.length - 1;
          return (
            <li key={step.key} className={cn('relative flex gap-3', !isLast && 'pb-4')}>
              {/* The rail to the next step, green while both ends are done. */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-0 left-[9px] top-5 w-px',
                    step.done && steps[index + 1].done ? 'bg-emerald-400/60' : 'bg-white/15'
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'relative mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
                  step.done
                    ? 'bg-emerald-400 text-navy'
                    : isOpen
                      ? 'border-2 border-white/70'
                      : 'border border-white/25'
                )}
              >
                {step.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p className="flex items-baseline justify-between gap-2">
                  <span
                    className={cn(
                      'text-sm leading-5',
                      isOpen
                        ? 'font-semibold text-white'
                        : step.disabled
                          ? 'text-white/40'
                          : 'text-white'
                    )}
                  >
                    {step.label}
                    <span className="sr-only">
                      {step.done ? ' (done)' : isOpen ? ' (to do)' : ''}
                    </span>
                  </span>
                  {step.date && (
                    <time
                      dateTime={step.date}
                      className="shrink-0 text-xs tabular-nums text-white/50"
                    >
                      {formatTimestamp(step.date, false)}
                    </time>
                  )}
                </p>
                {step.detail && (
                  <p
                    className={cn(
                      'mt-0.5 text-[13px] leading-[18px]',
                      step.truncate && 'truncate',
                      step.disabled ? 'text-white/30' : 'text-white/60'
                    )}
                  >
                    {step.detail}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
      {isAuthor ? (
        <Button
          data-testid="proposal-post-update"
          variant="default"
          onClick={() => showTab('updates')}
          className="mt-4 w-full gap-2 font-semibold"
        >
          <PenLine className="h-4 w-4" aria-hidden="true" />
          Post update
        </Button>
      ) : (
        canFund && (
          <FundButton
            data-testid="proposal-fund"
            icon={Trophy}
            className="mt-4 w-full font-semibold"
          >
            {awardActionLabel(fundraise)}
          </FundButton>
        )
      )}
    </FundingCard>
  );
}

/** The earliest contribution to the fundraise, if its contributors carry dates. */
function firstContributionDate(fundraise: Fundraise): string | undefined {
  const dates = (fundraise.contributors?.topContributors ?? [])
    .flatMap((contributor) => contributor.contributions ?? [])
    .map((contribution) => contribution.date)
    .filter((date) => date && !Number.isNaN(Date.parse(date)));
  if (dates.length === 0) return undefined;
  return dates.reduce((earliest, date) =>
    Date.parse(date) < Date.parse(earliest) ? date : earliest
  );
}
