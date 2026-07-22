'use client';

import type { GrantApplicationVisibility } from '@/types/grant';
import type { Work } from '@/types/work';
import type { WorkMetadata } from '@/services/metadata.service';
import type { RegisteredReportTrackerStep } from '@/types/registeredReport';
import { WorkHeaderGrant, WorkHeaderProposal } from '@/components/work/WorkHeader';
import { RegisteredReportRouteTrackerLoader } from './RegisteredReportRouteTrackerLoader';
import { RegisteredReportRouteTracker } from './RegisteredReportRouteTracker';
import { isValidRegisteredReportId } from '@/utils/registeredReportRoute';

function createCompletedProposalTracker(
  work: Work,
  registeredReportId: number | null
): RegisteredReportTrackerStep[] {
  const grant = work.linkedGrant;
  const grantPostId = grant?.postId ?? null;
  const grantTitle = grant?.title ?? grant?.shortTitle ?? null;

  return [
    {
      stage: 'grant',
      label: 'Funding Opportunity',
      exists: isValidRegisteredReportId(grantPostId),
      postId: grantPostId,
      title: grantTitle,
    },
    {
      stage: 'proposal',
      label: 'Proposal',
      exists: true,
      postId: work.id,
      title: work.title,
    },
    {
      stage: 'registered_report',
      label: 'Registered Report',
      exists: isValidRegisteredReportId(registeredReportId),
      postId: registeredReportId,
      title: null,
    },
  ];
}

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
  const isCompleted = metadata.fundraising?.status === 'COMPLETED';
  const registeredReportId =
    work.registeredReportId ?? metadata.fundraising?.registeredReportId ?? null;
  const validRegisteredReportId = isValidRegisteredReportId(registeredReportId)
    ? registeredReportId
    : null;

  return (
    <WorkHeaderProposal
      work={work}
      metadata={metadata}
      updatesCount={updatesCount}
      preTitle={
        isCompleted ? (
          <RegisteredReportRouteTracker
            tracker={createCompletedProposalTracker(work, validRegisteredReportId)}
            reportId={validRegisteredReportId}
            currentStage="proposal"
          />
        ) : (
          <RegisteredReportRouteTrackerLoader currentStage="proposal" currentPostId={work.id} />
        )
      }
    />
  );
}
