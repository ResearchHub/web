import { ApiClient } from './client';
import { Topic } from '@/types/topic';
import { AuthorProfile, transformAuthorProfile } from '@/types/user';
import { ContentMetrics } from '@/types/metrics';

export interface WorkMetadata {
  id: number;
  score: number;
  topics: Topic[];
  metrics: ContentMetrics;
  fundraising?: {
    id: number;
    amountRaised: {
      usd: number;
      rsc: number;
    };
    goalAmount: {
      usd: number;
      rsc: number;
    };
    status: 'OPEN' | 'COMPLETED' | 'CLOSED';
    goalCurrency: string;
    startDate: string;
    endDate: string;
    contributors: {
      numContributors: number;
      topContributors: AuthorProfile[];
    };
  };
}

function transformWorkMetadata(response: any): WorkMetadata {
  // Handle both array and object document structures
  const document = Array.isArray(response.documents) ? response.documents[0] : response.documents;

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
      reviews: response.reviews.count,
    },
    fundraising: response.fundraise
      ? {
          id: response.fundraise.id,
          amountRaised: response.fundraise.amount_raised,
          goalAmount: response.fundraise.goal_amount,
          status: response.fundraise.status,
          goalCurrency: response.fundraise.goal_currency,
          startDate: response.fundraise.start_date,
          endDate: response.fundraise.end_date,
          contributors: {
            numContributors: response.fundraise.contributors.total,
            topContributors: response.fundraise.contributors.top.map((contributor: any) =>
              transformAuthorProfile(contributor.author_profile)
            ),
          },
        }
      : undefined,
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
