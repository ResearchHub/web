import type { PoolProposal } from './proposals';

export interface PoolTotals {
  goalUsd: number;
  raisedUsd: number;
  remainingUsd: number;
}

export function getPoolTotals(proposals: PoolProposal[]): PoolTotals {
  const goalUsd = proposals.reduce((sum, p) => sum + p.goalUsd, 0);
  const raisedUsd = proposals.reduce((sum, p) => sum + p.raisedUsd, 0);
  return { goalUsd, raisedUsd, remainingUsd: Math.max(0, goalUsd - raisedUsd) };
}

export function remainingNeedUsd(proposal: PoolProposal): number {
  return Math.max(0, proposal.goalUsd - proposal.raisedUsd);
}

/**
 * Pick the single proposal a pooled contribution lands on.
 *
 * One contribution funds one proposal: a Stripe PaymentIntent is bound to a
 * single fundraise, so a true split would mean several charges with no rollback
 * between them. Evenness is statistical instead — drawing with probability
 * proportional to remaining need means expected dollars track what each
 * proposal still needs, so the pool fills at a roughly uniform rate.
 *
 * Random rather than always-neediest so a traffic spike doesn't send every
 * concurrent visitor at the same proposal, and so the feed's cache window
 * doesn't skew the outcome.
 */
export function selectPoolTarget(
  proposals: PoolProposal[],
  amountUsd: number,
  random: () => number = Math.random
): PoolProposal | null {
  const withNeed = proposals.filter((p) => remainingNeedUsd(p) > 0);
  if (withNeed.length === 0) return null;

  // Prefer proposals that can absorb the whole contribution so a large one
  // doesn't overshoot a nearly complete fundraise. If none can, the largest
  // gap absorbs the most of it.
  //
  // Note this only narrows anything when the caller knows the real amount.
  // PoolFundProvider draws when the modal opens, before the funder has typed
  // one, so today every proposal qualifies and a contribution can exceed what
  // its target still needs. That overshoot is accepted.
  const fits = withNeed.filter((p) => remainingNeedUsd(p) >= amountUsd);
  const candidates =
    fits.length > 0
      ? fits
      : [withNeed.reduce((a, b) => (remainingNeedUsd(b) > remainingNeedUsd(a) ? b : a))];

  const totalNeed = candidates.reduce((sum, p) => sum + remainingNeedUsd(p), 0);
  let roll = random() * totalNeed;
  for (const candidate of candidates) {
    roll -= remainingNeedUsd(candidate);
    if (roll <= 0) return candidate;
  }
  return candidates[candidates.length - 1];
}
