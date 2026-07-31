import { CommentFeed } from '@/components/Comment/CommentFeed';
import { Alert } from '@/components/ui/Alert';
import type { Work } from '@/types/work';

interface RegisteredReportProposalUpdatesProps {
  proposal: Work;
}

export function RegisteredReportProposalUpdates({
  proposal,
}: Readonly<RegisteredReportProposalUpdatesProps>) {
  return (
    <div className="mt-6 space-y-6">
      <Alert variant="info">
        These updates were posted for the proposal submission that led to this Registered Report.
      </Alert>
      <CommentFeed
        documentId={proposal.id}
        unifiedDocumentId={proposal.unifiedDocumentId || null}
        contentType={proposal.contentType}
        commentType="AUTHOR_UPDATE"
        workAuthors={proposal.authors}
        work={proposal}
        readOnly
      />
    </div>
  );
}
