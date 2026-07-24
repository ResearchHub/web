import { cache } from 'react';
import { notFound } from 'next/navigation';
import { MetadataService, type WorkMetadata } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';
import { ApiError } from '@/services/types';
import {
  getAverageProposalPeerReviewScore,
  type RegisteredReportProposalDetails,
  type RegisteredReportWork,
  type RegisteredReportWorkResponse,
} from '@/types/registeredReport';

export const getRegisteredReportWorkOrNotFound = cache(
  async (id: string | number): Promise<RegisteredReportWorkResponse> => {
    const normalizedId = Number(id);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
      notFound();
    }

    try {
      return await PostService.getRegisteredReportWork(normalizedId);
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }

      throw error;
    }
  }
);

const getMetadataByDocumentId = cache(async (documentId: number): Promise<WorkMetadata | null> => {
  try {
    return await MetadataService.get(documentId.toString());
  } catch {
    return null;
  }
});

export async function getRegisteredReportMetadata(
  work: RegisteredReportWork,
  proposal: RegisteredReportProposalDetails | null = null
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
  const metadata = !documentId
    ? fallbackMetadata
    : ((await getMetadataByDocumentId(documentId)) ?? fallbackMetadata);
  const proposalReviewScore = getAverageProposalPeerReviewScore(proposal);

  if (proposalReviewScore === undefined) return metadata;

  return {
    ...metadata,
    metrics: {
      ...metadata.metrics,
      reviewScore: proposalReviewScore,
    },
  };
}

export async function getRegisteredReportContent(
  work: RegisteredReportWork
): Promise<string | undefined> {
  const content = work.formattedHtml || work.fullSrc || work.fullMarkdown;
  if (content || !work.contentUrl) return content || undefined;

  try {
    return await PostService.getContent(work.contentUrl);
  } catch {
    return undefined;
  }
}
