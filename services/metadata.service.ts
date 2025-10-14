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
  const document = Array.isArray(response.documents) ? response.documents[0] : response.documents;
  const bounties = document.bounties?.map((bounty: any) => transformBounty(bounty)) || [];
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
      saves: 0,
      reviewScore: response.reviews.avg,
      conversationComments: document.discussion_aggregates.conversation_count || 0,
      reviewComments: document.discussion_aggregates.review_count || 0,
      bountyComments: openBounties,
    },
    fundraising: response.fundraise ? transformFundraise(response.fundraise) : undefined,
    bounties,
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
