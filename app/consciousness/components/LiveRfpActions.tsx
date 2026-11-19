'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BadgeCheck } from 'lucide-react';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { WorkCoverCard } from '@/components/work/WorkCoverCard';
import { isAwardMechanism } from '@/components/Funding/lib/fundingMechanism';
import { handOffRfp } from '@/components/AIMode/rfpHandoff';
import { newDraftTarget, workspaceHref } from '@/components/AIMode/workspaceUrl';
import { isGrantActive, type FundingPool, type Grant } from '@/types/grant';
import { CAMPAIGN } from '../data/rfp';
import { OrchActionsContext } from './OrchActions';

/**
 * The page's buttons wired to the RFP, as its own page wires them:
 * - Add to the pool opens the contribute panel on the grant's funding pool
 *   (`WorkHeaderGrant` mounts the same one); once a contribution lands the
 *   page refreshes, so the raised figure and backers catch up.
 * - Submit a proposal hands the RFP to the AI workspace and opens it, as
 *   `GrantPageProvider.applyToRfp` does. That provider is not used here
 *   because it also loads the RFP's activity feed, which this page loads
 *   only when its Activity tab is opened.
 * A pending or closed RFP says so instead. `showTaxLine` is for the campaign's
 * own RFP only: the tax line must not appear on another RFP's pool.
 */
export function LiveRfpActions({
  grant,
  title,
  imageUrl,
  showTaxLine,
  children,
}: {
  grant: Grant;
  title: string;
  imageUrl: string | null;
  showTaxLine: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [pool, setPool] = useState<FundingPool | null>(grant.fundingPool ?? null);
  useEffect(() => setPool(grant.fundingPool ?? null), [grant.fundingPool]);

  const isActive = isGrantActive(grant);
  const notOpen =
    grant.status === 'PENDING' ? 'This call opens once it is approved.' : 'This call is closed.';
  const grantId = String(grant.id);
  const organization = grant.organization?.trim() || grant.createdBy?.authorProfile?.fullName || '';

  const submitProposal = useCallback(() => {
    if (!isActive) {
      toast(notOpen, { id: 'orch-action' });
      return;
    }
    handOffRfp({
      id: grantId,
      shortTitle: grant.shortTitle || title,
      imageUrl: imageUrl ?? '',
      fundingAmount: grant.amount.usd ?? 0,
      organization,
      applicationVisibility: grant.applicationVisibility,
      fundingMechanism: grant.fundingMechanism ?? 'FUNDING',
    });
    router.push(workspaceHref(newDraftTarget('need_funding', grantId)));
  }, [isActive, notOpen, grant, grantId, title, imageUrl, organization, router]);

  const addToPool = useCallback(() => {
    if (!isActive || pool?.status !== 'OPEN') {
      toast(isActive ? 'The pool is not taking contributions.' : notOpen, { id: 'orch-action' });
      return;
    }
    setIsPanelOpen(true);
  }, [isActive, pool, notOpen]);

  const handleContributeSuccess = useCallback(
    (updatedPool?: FundingPool) => {
      if (updatedPool) setPool(updatedPool);
      router.refresh();
    },
    [router]
  );

  const value = useMemo(() => ({ submitProposal, addToPool }), [submitProposal, addToPool]);

  return (
    <OrchActionsContext.Provider value={value}>
      {children}
      {pool && (
        <ContributeToFundraiseModal
          mode="fundingPool"
          isOpen={isPanelOpen}
          onClose={() => setIsPanelOpen(false)}
          onContributeSuccess={handleContributeSuccess}
          fundingPool={pool}
          proposalTitle={title}
          variant="panel"
          topContent={
            <div className="space-y-3">
              <WorkCoverCard title={title} eyebrow="RFP" imageUrl={imageUrl ?? undefined} />
              {showTaxLine && (
                <p className="flex items-center gap-1.5 text-[13px] leading-snug text-gray-600">
                  <BadgeCheck aria-hidden className="h-4 w-4 shrink-0 text-primary-600" />
                  {CAMPAIGN.taxDeductibleLine}
                </p>
              )}
            </div>
          }
          isAward={isAwardMechanism(grant.fundingMechanism)}
          successText="Every dollar in the pool goes to the experiments funded under this call."
        />
      )}
    </OrchActionsContext.Provider>
  );
}
