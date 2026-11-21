'use client';

import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { WorkCoverCard } from '@/components/work/WorkCoverCard';
import { isAwardMechanism } from '@/components/Funding/lib/fundingMechanism';
import { handOffRfp } from '@/components/AIMode/rfpHandoff';
import AnalyticsService, { LogEvent } from '@/services/analytics.service';
import { newDraftTarget, workspaceHref } from '@/components/AIMode/workspaceUrl';
import { isGrantActive, type FundingPool, type Grant } from '@/types/grant';
import { OrchActionsContext } from '@/app/consciousness/components/OrchActions';
import { PROPOSAL_GUIDE } from '../data/content';
import { CAMPAIGN, formatUsdShort } from '../data/rfp';

/**
 * The page's buttons wired to the RFP, exactly as /consciousness wires its
 * own (`app/consciousness/components/LiveRfpActions.tsx`, which this
 * follows): Add to the pool opens the contribute panel on the grant's
 * funding pool, and Submit a proposal hands the RFP to the AI workspace. A
 * pending or closed RFP says so instead.
 */
export function AuditRfpActions({
  grant,
  title,
  imageUrl,
  children,
}: {
  grant: Grant;
  title: string;
  imageUrl: string | null;
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
    AnalyticsService.logEvent(LogEvent.RFP_SUBMIT_PROPOSAL_CLICKED, {
      page: 'audit',
      grant_id: grantId,
      open: isActive,
    });
    if (!isActive) {
      toast(notOpen, { id: 'audit-action' });
      return;
    }
    handOffRfp(
      {
        id: grantId,
        shortTitle: grant.shortTitle || title,
        imageUrl: imageUrl ?? '',
        fundingAmount: grant.amount.usd ?? 0,
        organization,
        applicationVisibility: grant.applicationVisibility,
        fundingMechanism: grant.fundingMechanism ?? 'FUNDING',
      },
      { ...PROPOSAL_GUIDE, fundingLabel: `${formatUsdShort(CAMPAIGN.goalUsd)} goal` }
    );
    router.push(workspaceHref(newDraftTarget('need_funding', grantId)));
  }, [isActive, notOpen, grant, grantId, title, imageUrl, organization, router]);

  const addToPool = useCallback(() => {
    const open = isActive && pool?.status === 'OPEN';
    AnalyticsService.logEvent(LogEvent.RFP_FUND_CLICKED, {
      page: 'audit',
      grant_id: grantId,
      open,
    });
    if (!open) {
      toast(isActive ? 'This call is not taking contributions.' : notOpen, { id: 'audit-action' });
      return;
    }
    setIsPanelOpen(true);
  }, [isActive, pool, notOpen, grantId]);

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
          headerTitle="Fund the audit"
          successTitle={(amount) => `You put ${amount} toward the audit`}
          successMessage="Thank you. Your contribution is in."
          topContent={
            <WorkCoverCard title={title} eyebrow="RFP" imageUrl={imageUrl ?? undefined} />
          }
          isAward={isAwardMechanism(grant.fundingMechanism)}
          successText="Every dollar goes to the audits funded under this call."
        />
      )}
    </OrchActionsContext.Provider>
  );
}
