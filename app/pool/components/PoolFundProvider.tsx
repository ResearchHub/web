'use client';

import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import type { Fundraise, FundraiseStatus } from '@/types/funding';
import { resolveCampaign, type PoolCampaign } from '../lib/campaign';
import { getPoolTotals, remainingNeedUsd, selectPoolTarget } from '../lib/pool';
import type { PoolProposal } from '../lib/proposals';

interface PoolFundContextValue {
  /** False when every CTA should fall back to `fallbackUrl`. */
  isFundable: boolean;
  fallbackUrl: string;
  openFundModal: () => void;
}

const PoolFundContext = createContext<PoolFundContextValue | null>(null);

/**
 * CTAs outside a provider degrade to a plain link rather than crashing the
 * page. Every campaign CTA is inside one, so this only guards against a future
 * component being mounted elsewhere.
 */
export function usePoolFund(): PoolFundContextValue {
  return (
    useContext(PoolFundContext) ?? { isFundable: false, fallbackUrl: '/', openFundModal: () => {} }
  );
}

/** Mirrors the amount the contribute modal opens with. */
const DEFAULT_CONTRIBUTION_USD = 100;

/**
 * The feed gives USD figures only. The modal derives RSC from the live
 * exchange rate and reads USD off `progressOverride`, so the RSC side of this
 * object is never displayed.
 */
function toFundraise(proposal: PoolProposal): Fundraise {
  return {
    id: proposal.fundraiseId,
    status: (proposal.status as FundraiseStatus) || 'OPEN',
    goalCurrency: 'USD',
    goalAmount: { usd: proposal.goalUsd, rsc: 0 },
    amountRaised: { usd: proposal.raisedUsd, rsc: 0 },
    contributors: { numContributors: proposal.contributors, topContributors: [] },
    createdDate: '',
    updatedDate: '',
    postId: proposal.id,
    postTitle: proposal.title,
    postSlug: proposal.slug,
  };
}

function truncate(text: string, max = 70) {
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}\u2026` : text;
}

interface PoolFundProviderProps {
  campaign: PoolCampaign;
  proposals: PoolProposal[];
  children: ReactNode;
}

/**
 * Holds the single pooled-funding modal for a campaign and hands every CTA a
 * way to open it.
 *
 * A contribution targets one proposal, drawn when the modal opens. The funder
 * sees the pool's combined progress rather than that proposal's, which is what
 * the landing page promises them.
 */
export function PoolFundProvider({
  campaign,
  proposals,
  children,
}: Readonly<PoolFundProviderProps>) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [target, setTarget] = useState<PoolProposal | null>(null);

  const totals = useMemo(() => getPoolTotals(proposals), [proposals]);
  const openCount = useMemo(
    () => proposals.filter((p) => remainingNeedUsd(p) > 0).length,
    [proposals]
  );

  const isFundable = resolveCampaign(campaign).isFundable && openCount > 0;

  const openFundModal = useCallback(() => {
    if (!isFundable) return;
    // Redrawn per open so repeat visitors and concurrent traffic spread out.
    const picked = selectPoolTarget(proposals, DEFAULT_CONTRIBUTION_USD);
    if (!picked) return;
    setTarget(picked);
    setIsOpen(true);
  }, [isFundable, proposals]);

  const value = useMemo<PoolFundContextValue>(
    () => ({ isFundable, fallbackUrl: campaign.fallbackUrl, openFundModal }),
    [isFundable, campaign.fallbackUrl, openFundModal]
  );

  const unit = openCount === 1 ? campaign.unit.singular : campaign.unit.plural;

  return (
    <PoolFundContext.Provider value={value}>
      {children}
      {target && (
        <ContributeToFundraiseModal
          isOpen={isOpen}
          onClose={() => setIsOpen(false)}
          onContributeSuccess={() => router.refresh()}
          fundraise={toFundraise(target)}
          headerTitle={campaign.fundLabel}
          headerSubtitle={`Pooled across ${openCount} open ${unit}`}
          progressOverride={{
            currentAmountUsd: totals.raisedUsd,
            goalAmountUsd: totals.goalUsd,
          }}
          allowDafPayment={false}
          maxAmountUsd={totals.remainingUsd}
          successMessage={`Your contribution went to "${truncate(target.title)}".`}
        />
      )}
    </PoolFundContext.Provider>
  );
}
