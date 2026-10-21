'use client';

import { type ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Work } from '@/types/work';
import { WorkMetadata } from '@/services/metadata.service';
import { ContributeToFundraiseModal } from '@/components/modals/ContributeToFundraiseModal';
import { useGrantTab } from '@/components/Funding/GrantPageContent';
import { useFundPanel } from '@/components/Funding/FundPanelContext';
import { WorkCoverCard } from '@/components/work/WorkCoverCard';
import type { FundingPool, GrantApplicationVisibility } from '@/types/grant';
import { WorkHeader } from './WorkHeader';
import { PendingReviewBadge } from './PendingReviewBadge';

interface WorkHeaderGrantProps {
  work: Work;
  metadata: WorkMetadata;
  grantId?: string;
  isActive?: boolean;
  isPending?: boolean;
  organization?: string;
  applicationVisibility?: GrantApplicationVisibility;
  fundingPool?: FundingPool | null;
  className?: string;
  preTitle?: ReactNode;
}

/**
 * The RFP page's cover. The tabs, key facts and pool card live in the page
 * beneath it; this keeps the Apply and Add to pool panels they open.
 */
export function WorkHeaderGrant({
  work,
  metadata,
  grantId,
  isActive = true,
  isPending = false,
  organization,
  applicationVisibility,
  fundingPool: fundingPoolProp = null,
  className,
  preTitle,
}: WorkHeaderGrantProps) {
  const router = useRouter();
  const {
    fundingPool: contextPool,
    setFundingPool,
    isApplyModalOpen,
    setIsApplyModalOpen,
  } = useGrantTab();
  const { isFundPanelOpen, closeFundPanel } = useFundPanel();

  const fundingPool = contextPool ?? fundingPoolProp;

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
    <PendingReviewBadge />
  ) : !isActive ? (
    <span className="inline-flex items-center rounded-md bg-white/95 px-2 py-0.5 text-xs font-semibold text-gray-700 shadow-sm">
      Closed
    </span>
  ) : null;

  return (
    <>
      <WorkHeader
        work={work}
        metadata={metadata}
        className={className}
        eyebrow={badges}
        preTitle={preTitle}
        hideVoteWidget
        // The top bar already says it's an RFP; the cover names who funds it.
        cover={{ imageUrl: work.image, eyebrow: organization }}
        grantModalProps={
          grantId
            ? {
                isApplyToGrantModalOpen: isApplyModalOpen,
                onCloseApplyToGrantModal: () => setIsApplyModalOpen(false),
                grantId,
                grantApplicationVisibility: applicationVisibility,
                applyPanel: {
                  cover: coverCard,
                  amountUsd: work.note?.post?.grant?.amount.usd,
                  organization,
                },
              }
            : undefined
        }
      />

      {fundingPool?.status === 'OPEN' && (
        <ContributeToFundraiseModal
          mode="fundingPool"
          isOpen={isFundPanelOpen}
          onClose={closeFundPanel}
          onContributeSuccess={handleContributeSuccess}
          fundingPool={fundingPool}
          proposalTitle={work.title}
          desktop="panel"
          singleStep
          topContent={coverCard}
          successText={`Every dollar in the pool goes to the proposals ${
            organization || 'the funder'
          } picks.`}
        />
      )}
    </>
  );
}
