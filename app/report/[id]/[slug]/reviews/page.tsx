import { MetadataService } from '@/services/metadata.service';
import { ApiError } from '@/services/types';
import { RegisteredReportProposalReviews } from '@/components/work/RegisteredReportProposalReviews';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import {
  getRegisteredReportMetadata,
  getRegisteredReportSourceProposalOrNotFound,
  getRegisteredReportWorkOrNotFound,
} from '@/components/work/registeredReportRouteServer';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

export default async function RegisteredReportReviewsPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const payload = await getRegisteredReportWorkOrNotFound(id);
  const [proposal, reportMetadata] = await Promise.all([
    getRegisteredReportSourceProposalOrNotFound(payload),
    getRegisteredReportMetadata(payload.work),
  ]);
  const proposalMetadata = proposal.unifiedDocumentId
    ? await MetadataService.getPost(proposal.unifiedDocumentId.toString()).catch((error) => {
        if (error instanceof ApiError && error.status === 404) return null;
        throw error;
      })
    : null;

  return (
    <>
      <RegisteredReportProposalReviews sourceProposalId={proposal.id} metadata={proposalMetadata} />
      <SearchHistoryTracker work={payload.work} />
      <WorkDocumentTracker work={payload.work} metadata={reportMetadata} tab="reviews" />
    </>
  );
}
