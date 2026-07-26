import { CommentFeed } from '@/components/Comment/CommentFeed';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';
import { Alert } from '@/components/ui/Alert';
import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

interface RegisteredReportProposalReviewsProps {
  proposal: Work;
  metadata: WorkMetadata | null;
}

export function RegisteredReportProposalReviews({
  proposal,
  metadata,
}: Readonly<RegisteredReportProposalReviewsProps>) {
  return (
    <div className="mt-6 space-y-6">
      <Alert variant="info">
        These peer reviews were written for the proposal submission that led to this Registered
        Report, and may have been addressed in the current version.
      </Alert>
      <CommentFeed
        documentId={proposal.id}
        unifiedDocumentId={proposal.unifiedDocumentId || null}
        contentType={proposal.contentType}
        commentType="REVIEW"
        workAuthors={proposal.authors}
        belowEditor={<ReviewStatusBanner bounties={metadata?.bounties ?? []} />}
        work={proposal}
        readOnly
        onlyAssessedReviews
      />
    </div>
  );
}
