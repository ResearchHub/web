import { notFound } from 'next/navigation';
import { MetadataService } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';
import { ApiError } from '@/services/types';
import { RegisteredReportProposalReviews } from '@/components/work/RegisteredReportProposalReviews';
import { SearchHistoryTracker } from '@/components/work/SearchHistoryTracker';
import { WorkDocumentTracker } from '@/components/WorkDocumentTracker';
import { hasRegisteredReportSourceProposal } from '@/utils/registeredReportRoute';
import {
  getRegisteredReportMetadata,
  getRegisteredReportWorkOrNotFound,
} from '@/components/work/registeredReportRouteServer';

interface Props {
  params: Promise<{
    id: string;
    slug: string;
  }>;
}

async function getSourceProposalOrNotFound(postId: number) {
  try {
    return await PostService.get(postId.toString());
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export default async function RegisteredReportReviewsPage({ params }: Readonly<Props>) {
  const { id } = await params;
  const payload = await getRegisteredReportWorkOrNotFound(id);
  const proposalStep = payload.tracker.find((step) => step.stage === 'proposal');

  if (!hasRegisteredReportSourceProposal(payload) || !proposalStep?.postId) {
    notFound();
  }

  const [reportMetadata, proposal] = await Promise.all([
    getRegisteredReportMetadata(payload.work, payload.proposal),
    getSourceProposalOrNotFound(proposalStep.postId),
  ]);
  const proposalMetadata = proposal.unifiedDocumentId
    ? await MetadataService.get(proposal.unifiedDocumentId.toString()).catch(() => null)
    : null;

  return (
    <>
      <RegisteredReportProposalReviews proposal={proposal} metadata={proposalMetadata} />
      <SearchHistoryTracker work={payload.work} />
      <WorkDocumentTracker work={payload.work} metadata={reportMetadata} tab="reviews" />
    </>
  );
}
