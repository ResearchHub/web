import { CommentFeed } from '@/components/Comment/CommentFeed';
import { Alert } from '@/components/ui/Alert';

interface RegisteredReportProposalUpdatesProps {
  sourceProposalId: number;
}

export function RegisteredReportProposalUpdates({
  sourceProposalId,
}: Readonly<RegisteredReportProposalUpdatesProps>) {
  return (
    <div className="mt-6 space-y-6">
      <Alert variant="info">
        These updates were posted for the proposal submission that led to this Registered Report.
      </Alert>
      <CommentFeed
        documentId={sourceProposalId}
        unifiedDocumentId={null}
        contentType="preregistration"
        commentType="AUTHOR_UPDATE"
        readOnly
      />
    </div>
  );
}
