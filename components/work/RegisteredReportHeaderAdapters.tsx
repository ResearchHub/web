'use client';

import type { GrantApplicationVisibility } from '@/types/grant';
import type { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import { WorkHeaderGrant, WorkHeaderProposal } from '@/components/work/WorkHeader';
import { RegisteredReportHeaderTabs } from './RegisteredReportHeaderTabs';

interface RegisteredReportGrantHeaderProps {
  work: Work;
  metadata: WorkMetadata;
  amountUsd?: number;
  grantId?: string;
  currentGrantId?: number | string | null;
  isActive?: boolean;
  isPending?: boolean;
  organization?: string;
  applicationVisibility?: GrantApplicationVisibility;
}

export function RegisteredReportGrantHeader({
  work,
  metadata,
  amountUsd,
  grantId,
  currentGrantId,
  isActive,
  isPending,
  organization,
  applicationVisibility,
}: RegisteredReportGrantHeaderProps) {
  return (
    <WorkHeaderGrant
      work={work}
      metadata={metadata}
      amountUsd={amountUsd}
      grantId={grantId}
      isActive={isActive}
      isPending={isPending}
      organization={organization}
      applicationVisibility={applicationVisibility}
      tabsWrapper={(tabs) => (
        <RegisteredReportHeaderTabs
          currentStage="grant"
          currentPostId={work.id}
          currentGrantId={currentGrantId ?? null}
        >
          {tabs}
        </RegisteredReportHeaderTabs>
      )}
    />
  );
}

interface RegisteredReportProposalHeaderProps {
  work: Work;
  metadata: WorkMetadata;
  updatesCount?: number;
}

export function RegisteredReportProposalHeader({
  work,
  metadata,
  updatesCount,
}: RegisteredReportProposalHeaderProps) {
  return (
    <WorkHeaderProposal
      work={work}
      metadata={metadata}
      updatesCount={updatesCount}
      tabsWrapper={(tabs) => (
        <RegisteredReportHeaderTabs
          currentStage="proposal"
          currentPostId={work.id}
          currentGrantId={work.linkedGrant?.id ?? null}
          currentFundraiseId={metadata.fundraising?.id ?? null}
        >
          {tabs}
        </RegisteredReportHeaderTabs>
      )}
    />
  );
}
