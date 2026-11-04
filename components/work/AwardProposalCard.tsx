'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Check, Trophy } from 'lucide-react';
import { FundButton } from '@/components/Funding/FundButton';
import { FundingCard } from '@/components/Funding/FundingCard';
import { formatFundingAmount } from '@/components/Funding/lib/fundingAmounts';
import { canAwardProposal, getAwardPhase } from '@/components/Funding/lib/fundingMechanism';
import { isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import { getLinkedGrantLink } from '@/components/work/lib/linkedGrant';
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
  /** The line under the label: the RFP's name, a date, what is waited on. */
  readonly detail?: ReactNode;
  /** The detail stays on one line, cut short: the RFP's name can run long. */
  readonly truncate?: boolean;
  readonly done: boolean;
  /** It can no longer happen: the RFP closed or the proposal expired. */
  readonly disabled: boolean;
}

/**
 * An award proposal's sidebar card. It shows the RFP's award and that nobody
 * fundraises on the proposal. Once this proposal has been paid, the amount is
 * what it received and Awarded is done. The grant creator can still pay it
 * while the RFP is open and the proposal has not expired.
 */
export function AwardProposalCard({
  fundraise,
  linkedGrant,
}: {
  fundraise: Fundraise;
  linkedGrant: LinkedGrant;
}) {
  const { user } = useUser();
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();
  const phase = getAwardPhase(fundraise);
  const awarded = phase === 'awarded';
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
  const headlineLabel = awarded ? 'awarded' : phase === 'set-aside' ? 'set aside' : 'in awards';

  const rfp = getLinkedGrantLink({ linkedGrant } as Work);
  const publishedAt = fundraise.startDate || fundraise.createdDate;

  const steps: TimelineStep[] = [
    {
      key: 'rfp',
      label: 'Applied to RFP',
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
      key: 'published',
      label: 'Proposal published',
      detail: publishedAt ? formatTimestamp(publishedAt, false) : undefined,
      done: true,
      disabled: false,
    },
    {
      key: 'awarded',
      label: 'Awarded',
      detail: awarded
        ? `${headline} from ${who}`
        : stillOpen
          ? `${who} picks who gets the award once results are posted.`
          : 'No longer open for awards',
      done: awarded,
      disabled: !awarded && !stillOpen,
    },
  ];
  const nextStep = steps.findIndex((step) => !step.done && !step.disabled);

  return (
    <FundingCard
      label="Competing for"
      aside={
        <span className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10 text-white">
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="sr-only">Award</span>
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
          const isNext = index === nextStep;
          const isLater = (nextStep !== -1 && index > nextStep) || step.disabled;
          const isLast = index === steps.length - 1;
          return (
            <li key={step.key} className={cn('relative flex gap-3', !isLast && 'pb-4')}>
              {/* The rail to the next step, green while both ends are done. */}
              {!isLast && (
                <span
                  aria-hidden="true"
                  className={cn(
                    'absolute bottom-0 left-[9px] top-5 w-px',
                    steps[index + 1].done ? 'bg-emerald-400/60' : 'bg-white/15'
                  )}
                />
              )}
              <span
                aria-hidden="true"
                className={cn(
                  'relative mt-px flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full',
                  step.done
                    ? 'bg-emerald-400 text-navy'
                    : isNext
                      ? 'border-2 border-white/70'
                      : 'border border-white/25'
                )}
              >
                {step.done && <Check className="h-3 w-3" strokeWidth={3} />}
              </span>
              <div className="min-w-0 flex-1">
                <p
                  className={cn(
                    'text-sm leading-5',
                    isNext ? 'font-semibold text-white' : isLater ? 'text-white/40' : 'text-white'
                  )}
                >
                  {step.label}
                  <span className="sr-only">{step.done ? ' (done)' : isNext ? ' (next)' : ''}</span>
                </p>
                {step.detail && (
                  <p
                    className={cn(
                      'mt-0.5 text-[13px] leading-[18px]',
                      step.truncate && 'truncate',
                      isLater ? 'text-white/30' : 'text-white/60'
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
      {canFund && (
        <FundButton data-testid="proposal-fund" icon={Trophy} className="mt-4 w-full font-semibold">
          Award
        </FundButton>
      )}
    </FundingCard>
  );
}
