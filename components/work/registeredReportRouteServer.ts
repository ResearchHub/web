import { cache } from 'react';
import { notFound } from 'next/navigation';
import { MetadataService, type WorkMetadata } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';
import { ApiError } from '@/services/types';
import {
  type RegisteredReportWork,
  type RegisteredReportWorkResponse,
} from '@/types/registeredReport';
import { hasRegisteredReportSourceProposal } from '@/utils/registeredReportRoute';

export const getRegisteredReportWorkOrNotFound = cache(
  async (id: string | number): Promise<RegisteredReportWorkResponse> => {
    const reportId = Number(id);

    try {
      return await PostService.getRegisteredReportWork(reportId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }

      throw error;
    }
  }
);

const getSourceProposalByPostIdOrNotFound = cache(async (postId: number) => {
  try {
    return await PostService.get(postId.toString());
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }
});

export function getRegisteredReportSourceProposalOrNotFound(payload: RegisteredReportWorkResponse) {
  return getSourceProposalByPostIdOrNotFound(
    getRegisteredReportSourceProposalPostIdOrNotFound(payload)
  );
}

export function getRegisteredReportSourceProposalPostIdOrNotFound(
  payload: RegisteredReportWorkResponse
): number {
  const proposalStep = payload.tracker.find((step) => step.stage === 'proposal');

  if (!hasRegisteredReportSourceProposal(payload) || !proposalStep?.postId) {
    notFound();
  }

  return proposalStep.postId;
}

const getMetadataByDocumentId = cache((documentId: number) =>
  MetadataService.get(documentId.toString())
);

export async function getRegisteredReportMetadata(
  work: RegisteredReportWork
): Promise<WorkMetadata> {
  const documentId = work.unifiedDocumentId;
  const fallbackMetadata: WorkMetadata = {
    id: documentId ?? work.id,
    score: work.metrics?.votes ?? 0,
    topics: work.topics ?? [],
    metrics: {
      votes: work.metrics?.votes ?? 0,
      comments: work.metrics?.comments ?? 0,
      saves: work.metrics?.saves ?? 0,
      reviewScore: work.metrics?.reviewScore ?? 0,
      conversationComments: 0,
      reviewComments: 0,
      bountyComments: 0,
    },
    bounties: [],
    activeBounties: 0,
    closedBounties: 0,
  };
  if (!documentId) return fallbackMetadata;

  try {
    return await getMetadataByDocumentId(documentId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return fallbackMetadata;
    throw error;
  }
}

export async function getRegisteredReportContent(
  work: RegisteredReportWork
): Promise<string | undefined> {
  const content = work.formattedHtml || work.fullSrc || work.fullMarkdown;
  if (content || !work.contentUrl) return content || undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch (error) {
    console.error('Failed to fetch Registered Report content:', error);
    return undefined;
  }
}
