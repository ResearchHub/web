import type { ReactNode } from 'react';
import { HeadlineAmount } from '@/components/Funding/dashboard/MyFundingHero';
import type { Money } from '@/components/Funding/dashboard/lib/myFundingModel';

/** What the page knows about the user's funding, enough to write its hero. */
export interface HeroFacts {
  readonly isOwnPage: boolean;
  readonly given: Money;
  readonly raised: Money;
  readonly asked: Money;
  readonly reviewEarned: Money;
  readonly fundedCount: number;
  readonly rfpCount: number;
  readonly rfpBudget: Money;
  readonly ownCount: number;
}

export interface HeroCopy {
  readonly headline: ReactNode;
  /** The same for everyone: the figures are in the headline, the tabs and the rail. */
  readonly line: string;
  /** Which side leads the page when the user is on both. */
  readonly lead: 'giving' | 'raising';
}

const LINE = 'Track your contributions and the science they support.';

const has = (amount: Money) => amount.usd > 0 || amount.rsc > 0;

/**
 * The hero's headline, built from what the user has done: what they gave,
 * what they raised, the RFPs they run, and what they earned reviewing.
 * Nobody tells the page which they are.
 */
export function buildHeroCopy(
  facts: HeroFacts,
  format: (amount: Money, options?: { shorten?: boolean }) => string
): HeroCopy {
  const gave = has(facts.given) || facts.fundedCount > 0;
  const raised = facts.isOwnPage && has(facts.raised);
  const lead = gave && raised && facts.raised.usd > facts.given.usd ? 'raising' : 'giving';

  if (gave && raised) {
    return {
      lead,
      line: LINE,
      headline: (
        <>
          You’ve given <HeadlineAmount>{format(facts.given)}</HeadlineAmount> and raised{' '}
          <HeadlineAmount tone="raising">{format(facts.raised)}</HeadlineAmount>.
        </>
      ),
    };
  }

  if (gave) {
    const who = facts.isOwnPage ? 'You’ve' : 'This funder has';
    return {
      lead,
      line: LINE,
      headline: (
        <>
          {who} put <HeadlineAmount>{format(facts.given)}</HeadlineAmount> into science.
        </>
      ),
    };
  }

  if (facts.isOwnPage && facts.ownCount > 0) {
    return {
      lead: 'raising',
      line: LINE,
      headline: raised ? (
        <>
          You’ve raised <HeadlineAmount tone="raising">{format(facts.raised)}</HeadlineAmount> for
          your research.
        </>
      ) : (
        <>
          You’re raising{' '}
          <HeadlineAmount tone="raising">{format(facts.asked, { shorten: true })}</HeadlineAmount>{' '}
          for your research.
        </>
      ),
    };
  }

  if (facts.rfpCount > 0) {
    return {
      lead: 'giving',
      line: LINE,
      headline: (
        <>
          Your RFPs offer <HeadlineAmount>{format(facts.rfpBudget)}</HeadlineAmount> for research.
        </>
      ),
    };
  }

  return {
    lead: 'raising',
    line: LINE,
    headline: (
      <>
        You’ve earned <HeadlineAmount tone="raising">{format(facts.reviewEarned)}</HeadlineAmount>{' '}
        reviewing research.
      </>
    ),
  };
}
