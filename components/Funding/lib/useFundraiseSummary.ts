'use client';

import { getEffectiveStatus, isFundraiseActive } from '@/components/Fund/lib/fundraiseUtils';
import {
  type Backer,
  formatFundingAmount,
  formatMoney,
  visiblePercent,
} from '@/components/Funding/lib/fundingAmounts';
import { useCurrencyPreference } from '@/contexts/CurrencyPreferenceContext';
import { useExchangeRate } from '@/contexts/ExchangeRateContext';
import { computeGoalRate, getContributionTotal, type Fundraise } from '@/types/funding';
import { formatDeadline } from '@/utils/date';
import { pluralizeSuffix } from '@/utils/stringUtils';

export interface FundraiseSummary {
  isActive: boolean;
  isCompleted: boolean;
  /** Why Fund is grayed out once the fundraise stops taking money. */
  fundUnavailableReason?: string;
  raised: string;
  goal: string;
  /** How much of the goal is raised, 0 to 100. */
  percent: number;
  /** The bar's fill: the percent, floored so a first small gift still shows. */
  barPercent: number;
  funderCount: number;
  /** "3 funders". */
  fundersText: string;
  /** The top funders, each with what they put in. */
  funders: Backer[];
  /** Dollars per RSC: the rate the goal was met at once completed, else today's. */
  rscToUsdRate: number;
  /** "54 days left", while it is open and has an end date. */
  timeLeft?: string;
}

/** A proposal's fundraise as its funding card and phone bar both show it. */
export function useFundraiseSummary(fundraise: Fundraise): FundraiseSummary {
  const { showUSD } = useCurrencyPreference();
  const { exchangeRate } = useExchangeRate();

  const status = getEffectiveStatus(fundraise);
  const isActive = isFundraiseActive(fundraise);
  const isCompleted = status === 'COMPLETED';
  const funderCount = fundraise.contributors.numContributors;

  // A completed fundraise raised its goal. Its RSC keeps changing in dollars,
  // so in USD both figures are pinned to the goal; in RSC, to what came in.
  const pinned = { usd: fundraise.goalAmount.usd, rsc: fundraise.amountRaised.rsc };
  const raised = isCompleted ? pinned : fundraise.amountRaised;
  const goal = isCompleted ? pinned : fundraise.goalAmount;

  const percent = isCompleted
    ? 100
    : fundraise.goalAmount.rsc > 0
      ? Math.min(100, (fundraise.amountRaised.rsc / fundraise.goalAmount.rsc) * 100)
      : 0;

  // Contributions come in RSC and in dollars. A completed fundraise converts
  // them at the rate its goal was met at, so each funder's share adds up to it.
  const rate =
    computeGoalRate(status, fundraise.goalAmount.usd, fundraise.amountRaised.rsc) ?? exchangeRate;
  const funders: Backer[] = fundraise.contributors.topContributors.map((contributor) => {
    const total = getContributionTotal(
      contributor.totalContribution,
      showUSD ? 'USD' : 'RSC',
      rate
    );
    return {
      id: contributor.id ?? contributor.authorProfile.id,
      name: contributor.authorProfile.fullName,
      image: contributor.authorProfile.profileImage,
      authorId: contributor.authorProfile.id,
      amount: formatMoney(showUSD ? Math.round(total) : total, showUSD),
    };
  });

  return {
    isActive,
    isCompleted,
    fundUnavailableReason: isActive
      ? undefined
      : isCompleted
        ? 'This proposal is fully funded'
        : 'This fundraise is no longer taking contributions',
    raised: formatFundingAmount(raised, showUSD),
    goal: formatFundingAmount(goal, showUSD),
    percent: Math.floor(percent),
    barPercent: visiblePercent(percent),
    funderCount,
    fundersText: `${funderCount} funder${pluralizeSuffix(funderCount)}`,
    funders,
    rscToUsdRate: rate,
    timeLeft: isActive && fundraise.endDate ? formatDeadline(fundraise.endDate) : undefined,
  };
}
