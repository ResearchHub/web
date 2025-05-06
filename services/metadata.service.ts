import { ApiClient } from './client';
import { Topic } from '@/types/topic';
import type { AuthorProfile } from '@/types/authorProfile';
import { transformAuthorProfile } from '@/types/authorProfile';
import { ContentMetrics } from '@/types/metrics';
import { Fundraise, transformFundraise } from '@/types/funding';
import { Bounty, transformBounty } from '@/types/bounty';
import { countOpenBounties, countClosedBounties } from '@/components/Bounty/lib/bountyUtil';

export interface WorkMetadata {
  id: number;
  score: number;
  topics: Topic[];
  metrics: ContentMetrics;
  fundraising?: Fundraise;
  bounties: Bounty[];
  openBounties: number;
  closedBounties: number;
}

function transformWorkMetadata(response: any): WorkMetadata {
  // Handle both array and object document structures
  const document = Array.isArray(response.documents) ? response.documents[0] : response.documents;

  // Transform bounties if they exist using the existing transformer
  const bounties = document.bounties?.map((bounty: any) => transformBounty(bounty)) || [];

  // Calculate open and closed bounty counts using utility functions
  const openBounties = countOpenBounties(bounties);
  const closedBounties = countClosedBounties(bounties);

  return {
    id: response.id,
    score: response.score,
    topics: response.hubs.map((hub: any) => ({
      id: hub.id,
      name: hub.name,
      slug: hub.slug,
    })),
    metrics: {
      votes: response.score,
      comments: document.discussion_aggregates.discussion_count,
      saves: 0, // Not provided in metadata response
      reviewScore: response.reviews.avg,
      reviews: document.discussion_aggregates.review_count,
    },
    fundraising: response.fundraise ? transformFundraise(response.fundraise) : undefined,
    bounties: bounties,
    openBounties,
    closedBounties,
  };
}

export class MetadataService {
  private static readonly BASE_PATH = '/api/researchhub_unified_document';

  static async get(unifiedDocumentId: string): Promise<WorkMetadata> {
    const response = await ApiClient.get<any>(
      `${this.BASE_PATH}/${unifiedDocumentId}/get_document_metadata/`
    );
    return transformWorkMetadata(response);
  }
}
