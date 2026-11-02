'use client';

import { type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { ApplyToGrantPanel } from '@/components/modals/ApplyToGrantPanel';
import { useGrantPage } from '@/components/Funding/GrantPageContext';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { COVER_CHIP_CLASS, CoverBadge } from '@/components/work/WorkCover';
import { WorkCoverCard } from '@/components/work/WorkCoverCard';
import type { FundingPool } from '@/types/grant';
import { WorkHeader } from './WorkHeader';
import { PendingReviewBadge } from './PendingReviewBadge';

interface WorkHeaderGrantProps {
  work: Work;
  metadata: WorkMetadata;
  preTitle?: ReactNode;
}

/**
 * The RFP page's cover. The tabs, byline and pool card live in the page
 * beneath it; this keeps the Apply and Add to pool panels they open.
 */
export function WorkHeaderGrant({ work, metadata, preTitle }: WorkHeaderGrantProps) {
  const router = useRouter();
  const {
    grantId,
    organization,
    organizationProfile,
    applicationVisibility,
    grantAmount,
    isPending,
    isActive,
    fundingPool,
    setFundingPool,
    isApplyPanelOpen,
    setIsApplyPanelOpen,
  } = useGrantPage();
  const { isFundPanelOpen, closeFundPanel } = useFundPanel();

  // The panel stays open on its "Added to the pool" screen; the page behind it
  // catches up with the new pool.
  const handleContributeSuccess = useCallback(
    (updatedPool?: FundingPool) => {
      if (updatedPool) setFundingPool(updatedPool);
      router.refresh();
    },
    [router, setFundingPool]
  );

  const eyebrow = organization ? `RFP · ${organization}` : 'RFP';
  // Both panels (fund the pool, apply) open on the RFP's cover, small.
  const coverCard = <WorkCoverCard title={work.title} eyebrow={eyebrow} imageUrl={work.image} />;

  const badges = isPending ? (
    <PendingReviewBadge className={COVER_CHIP_CLASS} />
  ) : !isActive ? (
    <CoverBadge>Closed</CoverBadge>
  ) : null;

  return (
    <>
      <WorkHeader
        work={work}
        metadata={metadata}
        preTitle={preTitle}
        hideVoteWidget
        // The top bar already says it's an RFP; the cover names who funds it,
        // linked to the organization's own account when it has one.
        cover={{
          imageUrl: work.image,
          eyebrow: organization
            ? {
                name: organization,
                image: organizationProfile?.profileImage,
                authorId: organizationProfile?.id,
              }
            : undefined,
          badges,
        }}
        // Its phone page has the pool (byline, action bar) and the activity
        // (Activity tab) already.
        hideSidebarButton
      />

      {grantId && (
        <ApplyToGrantPanel
          isOpen={isApplyPanelOpen}
          onClose={() => setIsApplyPanelOpen(false)}
          grantId={grantId}
          applicationVisibility={applicationVisibility}
          cover={coverCard}
          amountUsd={grantAmount?.usd}
          organization={organization}
        />
      )}

      {fundingPool?.status === 'OPEN' && (
        <ContributeToFundraiseModal
          mode="fundingPool"
          isOpen={isFundPanelOpen}
          onClose={closeFundPanel}
          onContributeSuccess={handleContributeSuccess}
          fundingPool={fundingPool}
          proposalTitle={work.title}
          variant="panel"
          topContent={coverCard}
          successText={`Every dollar in the pool goes to the proposals ${
            organization || 'the funder'
          } picks.`}
        />
      )}
    </>
  );
}
