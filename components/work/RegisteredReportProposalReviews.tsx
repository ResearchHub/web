import { CommentFeed } from '@/components/Comment/CommentFeed';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';
import { Alert } from '@/components/ui/Alert';
import type { WorkMetadata } from '@/services/metadata.service';

interface RegisteredReportProposalReviewsProps {
  sourceProposalId: number;
  metadata: WorkMetadata | null;
}

export function RegisteredReportProposalReviews({
  sourceProposalId,
  metadata,
}: Readonly<RegisteredReportProposalReviewsProps>) {
  return (
    <div className="mt-6 space-y-6">
      <Alert variant="info">
        These peer reviews were written for the proposal submission that led to this Registered
        Report, and may have been addressed in the current version.
      </Alert>
      <CommentFeed
        documentId={sourceProposalId}
        unifiedDocumentId={null}
        contentType="preregistration"
        commentType="REVIEW"
        belowEditor={<ReviewStatusBanner bounties={metadata?.bounties ?? []} />}
        readOnly
        onlyAssessedReviews
      />
    </div>
  );
}
