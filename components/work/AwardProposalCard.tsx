'use client';

import Link from 'next/link';
import { Check, ChevronRight, Circle, Trophy } from 'lucide-react';
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
  const rfp = getLinkedGrantLink({ linkedGrant } as Work);
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

  const steps = [
    { label: 'Proposal published', done: true, disabled: false },
    { label: 'Awarded', done: awarded, disabled: !awarded && !stillOpen },
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
      <p className="mt-3 text-sm leading-snug text-white/75">
        {who} picks who gets the award once results are posted.
      </p>
      <ol className="mt-4 space-y-2">
        {steps.map((step, index) => {
          const isNext = index === nextStep;
          const isLater = (nextStep !== -1 && index > nextStep) || step.disabled;
          return (
            <li key={step.label} className="flex items-center gap-2.5 text-sm">
              {step.done ? (
                <Check
                  className="h-4 w-4 shrink-0 text-emerald-400"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className={`h-4 w-4 shrink-0 ${isLater ? 'text-white/25' : 'text-white/50'}`}
                  aria-hidden="true"
                />
              )}
              <span
                className={
                  isNext ? 'font-semibold text-white' : isLater ? 'text-white/40' : 'text-white'
                }
              >
                {step.label}
              </span>
            </li>
          );
        })}
      </ol>
      {canFund && (
        <FundButton data-testid="proposal-fund" icon={Trophy} className="mt-4 w-full font-semibold">
          Award
        </FundButton>
      )}
      {grantOpen && rfp.href && rfp.title && (
        <Link
          href={rfp.href}
          className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-white hover:text-white/80"
        >
          Add to {rfp.title}&apos;s award pool
          <ChevronRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      )}
    </FundingCard>
  );
}
