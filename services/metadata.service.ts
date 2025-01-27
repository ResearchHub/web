import { ApiClient } from './client';
import { Hub } from '@/types/hub';
import { AuthorProfile, transformAuthorProfile } from '@/types/user';
import { ContentMetrics } from '@/types/metrics';

interface DocumentData {
  bounties: any[];
  discussion_aggregates: {
    review_count: number;
    summary_count: number;
    discussion_count: number;
  };
  purchases: any[];
  user_vote: any;
}

interface MetadataResponse {
  id: number;
  documents: DocumentData | DocumentData[];
  hubs: Array<
    Hub & {
      created_date: string;
      is_used_for_rep: boolean;
    }
  >;
  reviews: {
    avg: number;
    count: number;
  };
  fundraise?: {
    id: number;
    amount_raised: {
      usd: number;
      rsc: number;
    };
    goal_amount: {
      usd: number;
      rsc: number;
    };
    contributors: {
      total: number;
      top: Array<{
        id: number;
        author_profile: {
          id: number;
          first_name: string;
          last_name: string;
          profile_image: string;
        };
        first_name: string;
        last_name: string;
      }>;
    };
    status: 'OPEN' | 'COMPLETED' | 'CLOSED';
    goal_currency: string;
    start_date: string;
    end_date: string;
  };
  score: number;
}

export interface WorkMetadata {
  id: number;
  score: number;
  hubs: Hub[];
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

function transformWorkMetadata(response: MetadataResponse): WorkMetadata {
  // Handle both array and object document structures
  const document = Array.isArray(response.documents) ? response.documents[0] : response.documents;

  return {
    id: response.id,
    score: response.score,
    hubs: response.hubs,
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
            topContributors: response.fundraise.contributors.top.map((contributor) =>
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
    const response = await ApiClient.get<MetadataResponse>(
      `${this.BASE_PATH}/${unifiedDocumentId}/get_document_metadata/`
    );
    return transformWorkMetadata(response);
  }
}
