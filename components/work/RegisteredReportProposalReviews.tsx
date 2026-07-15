import { CommentFeed } from '@/components/Comment/CommentFeed';
import { ReviewStatusBanner } from '@/components/Bounty/ReviewStatusBanner';
import type { WorkMetadata } from '@/services/metadata.service';
import type { Work } from '@/types/work';

interface RegisteredReportProposalReviewsProps {
  proposal: Work;
  metadata: WorkMetadata | null;
}

/**
 * Displays the source proposal's peer reviews from the Registered Report.
 * Reviews and replies stay readable, but this surface does not permit changes.
 */
export function RegisteredReportProposalReviews({
  proposal,
  metadata,
}: RegisteredReportProposalReviewsProps) {
  return (
    <div className="mt-6 space-y-6">
      <CommentFeed
        documentId={proposal.id}
        unifiedDocumentId={proposal.unifiedDocumentId || null}
        contentType={proposal.contentType}
        commentType="REVIEW"
        workAuthors={proposal.authors}
        belowEditor={<ReviewStatusBanner bounties={metadata?.bounties ?? []} />}
        work={proposal}
        readOnly
      />
    </div>
  );
}
