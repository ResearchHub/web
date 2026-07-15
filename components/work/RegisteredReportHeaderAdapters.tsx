'use client';

import type { GrantApplicationVisibility } from '@/types/grant';
import type { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import { WorkHeaderGrant, WorkHeaderProposal } from '@/components/work/WorkHeader';
import { RegisteredReportRouteTrackerLoader } from './RegisteredReportRouteTrackerLoader';

interface RegisteredReportGrantHeaderProps {
  work: Work;
  metadata: WorkMetadata;
  amountUsd?: number;
  grantId?: string;
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
      preTitle={<RegisteredReportRouteTrackerLoader currentStage="grant" currentPostId={work.id} />}
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
      preTitle={
        <RegisteredReportRouteTrackerLoader currentStage="proposal" currentPostId={work.id} />
      }
    />
  );
}
