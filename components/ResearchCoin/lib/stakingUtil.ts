import type { StakingBalanceLot } from '@/services/user.service';
import { formatRSC, formatUsdValue } from '@/utils/number';

export interface NextTierDetails {
  /** Lot whose next tier kicks in soonest. */
  lot: StakingBalanceLot;
  /** Multiplier the user will reach when this lot crosses its next tier. */
  projectedMultiplier: number;
  /** Days until that tier kicks in. */
  daysUntilNext: number;
  /** 0–1 fraction of the way through the lot's current tier window. */
  progress: number;
}

/**
 * Find the upcoming-tier event closest to "now" across a user's balance lots.
 * Each lot tracks its own multiplier progression; we surface the soonest one
 * so the UI can show "what's coming next".
 */
export function getNextTierDetails(
  balanceLots: StakingBalanceLot[] | undefined | null,
  now: number = Date.now()
): NextTierDetails | null {
  if (!balanceLots?.length) return null;

  const candidates = balanceLots.filter(
    (lot) =>
      lot.nextMultiplierDate != null &&
      lot.projectedOverallMultiplier != null &&
      lot.daysUntilNextMultiplier != null
  );
  if (!candidates.length) return null;

  const closest = candidates.reduce((best, lot) => {
    const lotDelta = Math.abs(new Date(lot.nextMultiplierDate!).getTime() - now);
    const bestDelta = Math.abs(new Date(best.nextMultiplierDate!).getTime() - now);
    return lotDelta < bestDelta ? lot : best;
  }, candidates[0]);

  const remaining = closest.daysUntilNextMultiplier!;
  const totalWindow = closest.ageDays + remaining;
  const progress = totalWindow > 0 ? closest.ageDays / totalWindow : 0;

  return {
    lot: closest,
    projectedMultiplier: closest.projectedOverallMultiplier!,
    daysUntilNext: remaining,
    progress,
  };
}

export interface FormattedFundingCreditsAmount {
  usd: string | null;
  rsc: string | null;
}

/**
 * Format a funding-credits amount (in RSC) into both USD and RSC display
 * strings. Layout (which goes on top) is left to the caller via an `isUSD`
 * flag in JSX.
 */
export function formatFundingCreditsAmount(
  amountRsc: number | null,
  exchangeRate: number | null
): FormattedFundingCreditsAmount {
  if (amountRsc == null) return { usd: null, rsc: null };
  return {
    usd: exchangeRate ? formatUsdValue(amountRsc.toString(), exchangeRate) : null,
    rsc: `${formatRSC({ amount: amountRsc, decimalPlaces: 2 })} RSC`,
  };
}
