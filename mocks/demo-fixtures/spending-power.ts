/**
 * Demo spending-power figures shown in SpendingPowerCard when NEXT_PUBLIC_DEMO_MODE=true.
 * Mirrors the mock (2.html option 7a): $1,250 total = $1,000 credits + $250 RSC balance.
 */
export const DEMO_SPENDING_POWER = {
  /** Spendable RSC balance in USD equivalent */
  balanceUsd: 250,
  /** Spendable RSC balance in RSC (at ~$0.02/RSC) */
  balanceRsc: 12500,
  /** Funding credits (locked RSC yield) in USD equivalent */
  creditsUsd: 1000,
  /** Funding credits in RSC */
  creditsRsc: 50000,
  /** Total spending power in USD */
  totalUsd: 1250,
  /** Displayed APY yield (mocked — no live backend value) */
  apyPercent: 8.2,
} as const;
