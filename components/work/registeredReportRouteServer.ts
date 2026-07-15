import { cache } from 'react';
import { notFound } from 'next/navigation';
import { MetadataService, type WorkMetadata } from '@/services/metadata.service';
import { PostService } from '@/services/post.service';
import {
  getAverageProposalPeerReviewScore,
  type RegisteredReportProposalDetails,
  type RegisteredReportWork,
  type RegisteredReportWorkResponse,
} from '@/types/registeredReport';
import { createRegisteredReportFallbackMetadata } from './registeredReportWorkUtils';

export const getRegisteredReportWorkOrNotFound = cache(
  async (id: string | number): Promise<RegisteredReportWorkResponse> => {
    const normalizedId = Number(id);
    if (!Number.isInteger(normalizedId) || normalizedId <= 0) {
      notFound();
    }

    try {
      return await PostService.getRegisteredReportWork(normalizedId);
    } catch {
      notFound();
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
  const metadata = !documentId
    ? createRegisteredReportFallbackMetadata(work)
    : ((await getMetadataByDocumentId(documentId)) ?? createRegisteredReportFallbackMetadata(work));
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
