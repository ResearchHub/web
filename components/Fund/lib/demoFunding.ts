'use client';

/**
 * Demo-only funding helpers.
 *
 * These make the "Fund Proposal" flow *appear* to work end-to-end for a single
 * scripted demo proposal, without touching the network or the real payment
 * backend. Nothing here runs for any other document.
 *
 * The flow it powers:
 *  1. Apple Pay is force-shown (and pre-selected) in the payment step.
 *  2. Paying with a test credit card is short-circuited to an instant success.
 *  3. The fundraise is marked "funded" in an in-memory store, so the progress
 *     bars (`FundraiseProgress`, `FundraiseSection`) render as COMPLETED /
 *     100% / green even though the server still reports the fundraise as OPEN.
 *
 * The "funded" state lives only in module memory (never persisted), so a full
 * page refresh resets the whole flow. It does survive soft client navigation /
 * `router.refresh()`, which is what keeps the success state visible right after
 * paying. Gated behind `isDemoFundProposalId` (proposal id) for the interactive
 * parts.
 */

import { useEffect, useState } from 'react';
import type { Fundraise } from '@/types/funding';

/** The only proposal this demo funding flow is wired up for. */
export const DEMO_FUND_PROPOSAL_ID = 30;

export function isDemoFundProposalId(id: number | string | undefined | null): boolean {
  return Number(id) === DEMO_FUND_PROPOSAL_ID;
}

/** Custom event dispatched (same tab) when a demo fundraise is marked funded. */
const DEMO_FUNDRAISE_FUNDED_EVENT = 'demo-fundraise-funded';

/**
 * In-memory set of "funded" fundraise ids. Intentionally not persisted so a
 * hard page refresh clears it and the demo starts over.
 */
const fundedFundraiseIds = new Set<string>();

export function isDemoFundraiseFunded(fundraiseId: number | string | undefined | null): boolean {
  if (fundraiseId == null) return false;
  return fundedFundraiseIds.has(String(fundraiseId));
}

/**
 * Flag a demo fundraise as funded (in memory only) and notify any mounted
 * progress components (via a custom event) so they update without a reload.
 */
export function markDemoFundraiseFunded(fundraiseId: number | string | undefined | null): void {
  if (fundraiseId == null || typeof window === 'undefined') return;
  fundedFundraiseIds.add(String(fundraiseId));
  window.dispatchEvent(new CustomEvent(DEMO_FUNDRAISE_FUNDED_EVENT, { detail: { fundraiseId } }));
}

/**
 * Return a COMPLETED clone of the fundraise (fully funded) when its demo
 * "funded" flag is set; otherwise return the fundraise unchanged.
 */
export function applyDemoFundraiseCompletion(fundraise: Fundraise): Fundraise {
  if (!isDemoFundraiseFunded(fundraise.id)) return fundraise;

  return {
    ...fundraise,
    status: 'COMPLETED',
    amountRaised: {
      rsc: fundraise.goalAmount.rsc,
      usd: fundraise.goalAmount.usd,
    },
    contributors: {
      ...fundraise.contributors,
      numContributors: (fundraise.contributors?.numContributors ?? 0) + 1,
    },
  };
}

/**
 * Client hook: returns the fundraise, replaced with a fully-funded COMPLETED
 * version once the demo "funded" flag is set. Re-renders when the flag flips
 * (same-tab custom event). Resets on a full page refresh since the flag is
 * held only in module memory.
 */
export function useDemoFundraise(fundraise: Fundraise | null): Fundraise | null {
  const [funded, setFunded] = useState(false);

  useEffect(() => {
    if (!fundraise) return;

    const sync = () => setFunded(isDemoFundraiseFunded(fundraise.id));
    sync();

    window.addEventListener(DEMO_FUNDRAISE_FUNDED_EVENT, sync);
    return () => {
      window.removeEventListener(DEMO_FUNDRAISE_FUNDED_EVENT, sync);
    };
  }, [fundraise?.id]);

  if (!fundraise) return null;
  return funded ? applyDemoFundraiseCompletion(fundraise) : fundraise;
}
