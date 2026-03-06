import type { Fundraise } from '@/types/funding';

interface FundraiseDisplayAmounts {
  displayAmountRaisedUsd: number;
  displayGoalAmountUsd: number;
  displayAmountRaisedRsc: number;
  displayGoalAmountRsc: number;
  displayProgressPercent: number;
}

export const getFundraiseDisplayAmounts = (fundraise: Fundraise): FundraiseDisplayAmounts => {
  if (fundraise.status === 'COMPLETED') {
    const completedUsd = fundraise.goalAmount.usd ?? 0;
    const completedRsc = fundraise.amountRaised.rsc ?? 0;

    return {
      displayAmountRaisedUsd: completedUsd,
      displayGoalAmountUsd: completedUsd,
      displayAmountRaisedRsc: completedRsc,
      displayGoalAmountRsc: completedRsc,
      displayProgressPercent: 100,
    };
  }

  const displayAmountRaisedRsc = fundraise.amountRaised.rsc ?? 0;
  const displayGoalAmountRsc = fundraise.goalAmount.rsc ?? 0;
  const displayProgressPercent =
    displayGoalAmountRsc > 0 ? (displayAmountRaisedRsc / displayGoalAmountRsc) * 100 : 0;

  return {
    displayAmountRaisedUsd: fundraise.amountRaised.usd ?? 0,
    displayGoalAmountUsd: fundraise.goalAmount.usd ?? 0,
    displayAmountRaisedRsc,
    displayGoalAmountRsc,
    displayProgressPercent,
  };
};
