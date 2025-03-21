import { ApiClient } from './client';
import { ID } from '@/types/root';
import { BountyType } from '@/types/bounty';
import { FeedEntry, RawApiFeedEntry, transformFeedEntry } from '@/types/feed';

interface BountyAwardPayload {
  content_type: 'rhcommentmodel';
  object_id: ID;
  amount: string;
}

interface BountyAward {
  commentId: ID;
  amount: number;
}

interface ContributeToBountyPayload {
  amount: number;
  item_content_type: string;
  item_object_id: ID;
  bounty_type: BountyType;
  expiration_date: string;
}

// Raw bounty response from the API
interface RawBounty {
  id: number;
  created_by: {
    id: number;
    author_profile: {
      id: number;
      first_name: string;
      last_name: string;
      profile_image: string;
      is_verified: boolean;
    };
  };
  content_type: {
    id: number;
    name: string;
  };
  item: {
    id: number;
    comment_content_json: any;
    comment_content_type: string;
    comment_type: string;
  };
  total_amount: number;
  unified_document: {
    id: number;
    documents: {
      id: number;
      authors: Array<{
        id: number;
        first_name: string;
        last_name: string;
        user: any;
        authorship: {
          position: string;
          is_corresponding: boolean;
        };
      }>;
      title: string;
      abstract: string;
      slug: string;
    };
    document_type: string;
  };
  hubs: Array<{
    id: number;
    name: string;
    namespace: string | null;
    slug: string;
    is_used_for_rep: boolean;
  }>;
  created_date: string;
  expiration_date: string;
  bounty_type: string;
  status: string;
}

interface FetchBountiesResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: RawBounty[];
}

export class BountyService {
  private static readonly BASE_PATH = '/api';

  static async awardBounty(bountyId: ID, awards: BountyAward[]): Promise<void> {
    // Filter out any awards with zero or negative amounts
    const validAwards = awards.filter((award) => award.amount > 0);

    if (validAwards.length === 0) {
      throw new Error('No valid awards found. All awards must have an amount greater than 0.');
    }

    const payload = validAwards.map((award) => ({
      content_type: 'rhcommentmodel' as const,
      object_id: award.commentId,
      amount: award.amount.toFixed(1), // Format as string with 1 decimal place
    }));

    const path = `${this.BASE_PATH}/bounty/${bountyId}/approve_bounty/`;
    await ApiClient.post<void>(path, payload);
  }

  static async contributeToBounty(
    objectId: ID,
    amount: number,
    objectContentType: string = 'rhcommentmodel',
    bountyType: BountyType,
    expirationDate: string
  ): Promise<void> {
    if (amount <= 0) {
      throw new Error('Contribution amount must be greater than 0.');
    }

    const payload: ContributeToBountyPayload = {
      amount: amount,
      item_content_type: objectContentType,
      item_object_id: objectId,
      bounty_type: bountyType,
      expiration_date: expirationDate,
    };

    const path = `${this.BASE_PATH}/bounty/`;
    await ApiClient.post<void>(path, payload);
  }

  /**
   * Fetches open bounties with personalization and sorts by creation date
   * @param params Optional parameters to customize the bounty fetch
   * @returns An object containing the transformed bounty entries and pagination info
   */
  static async fetchBounties(params?: {
    status?: string;
    personalized?: boolean;
    sort?: string;
    onlyParentBounties?: boolean;
    page?: number;
    pageSize?: number;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean; total: number }> {
    // Set default parameters
    const defaultParams = {
      status: 'OPEN',
      personalized: true,
      sort: '-created_date',
      only_parent_bounties: true,
      page: 1,
      page_size: 10,
    };

    // Merge default parameters with provided parameters
    const queryParams = new URLSearchParams();

    // Status parameter
    if (params?.status !== undefined) {
      queryParams.append('status', params.status);
    } else {
      queryParams.append('status', defaultParams.status);
    }

    // Personalized parameter
    if (params?.personalized !== undefined) {
      queryParams.append('personalized', params.personalized.toString());
    } else {
      queryParams.append('personalized', defaultParams.personalized.toString());
    }

    // Sort parameter
    if (params?.sort !== undefined) {
      queryParams.append('sort', params.sort);
    } else {
      queryParams.append('sort', defaultParams.sort);
    }

    // Only parent bounties parameter
    if (params?.onlyParentBounties !== undefined) {
      queryParams.append('only_parent_bounties', params.onlyParentBounties.toString());
    } else {
      queryParams.append('only_parent_bounties', defaultParams.only_parent_bounties.toString());
    }

    // Pagination parameters
    if (params?.page !== undefined) {
      queryParams.append('page', params.page.toString());
    } else {
      queryParams.append('page', defaultParams.page.toString());
    }

    if (params?.pageSize !== undefined) {
      queryParams.append('page_size', params.pageSize.toString());
    } else {
      queryParams.append('page_size', defaultParams.page_size.toString());
    }

    const url = `${this.BASE_PATH}/bounty/?${queryParams.toString()}`;

    try {
      const response = await ApiClient.get<FetchBountiesResponse>(url);

      // Transform the raw bounties into the format expected by transformFeedEntry
      const transformedEntries = response.results.map((rawBounty) => {
        // Map the raw bounty to the expected RawApiFeedEntry format
        const feedEntry: RawApiFeedEntry = {
          id: rawBounty.id,
          content_type: 'BOUNTY', // Set content_type to 'BOUNTY' for proper transformation
          content_object: {
            id: rawBounty.id,
            amount: rawBounty.total_amount,
            status: rawBounty.status,
            expiration_date: rawBounty.expiration_date,
            bounty_type: rawBounty.bounty_type,
            created_date: rawBounty.created_date,
            // Map the comment data if available
            comment: rawBounty.item
              ? {
                  id: rawBounty.item.id,
                  comment_content_json: rawBounty.item.comment_content_json,
                  comment_content_type: rawBounty.item.comment_content_type,
                  comment_type: rawBounty.item.comment_type,
                }
              : undefined,
            // Map the paper data if available
            paper:
              rawBounty.unified_document && rawBounty.unified_document.document_type === 'PAPER'
                ? {
                    id: rawBounty.unified_document.documents.id,
                    title: rawBounty.unified_document.documents.title,
                    abstract: rawBounty.unified_document.documents.abstract,
                    slug: rawBounty.unified_document.documents.slug,
                    authors: rawBounty.unified_document.documents.authors,
                    hub:
                      rawBounty.hubs && rawBounty.hubs.length > 0 ? rawBounty.hubs[0] : undefined,
                  }
                : undefined,
            // Map the post data if available
            post:
              rawBounty.unified_document && rawBounty.unified_document.document_type !== 'PAPER'
                ? {
                    id: rawBounty.unified_document.documents.id,
                    title: rawBounty.unified_document.documents.title,
                    slug: rawBounty.unified_document.documents.slug,
                  }
                : undefined,
            // Include hubs
            hubs: rawBounty.hubs,
          },
          created_date: rawBounty.created_date,
          action: 'open', // Default action for bounties
          action_date: rawBounty.created_date,
          // Map the author data
          author: {
            id: rawBounty.created_by.id,
            first_name: rawBounty.created_by.author_profile.first_name,
            last_name: rawBounty.created_by.author_profile.last_name,
            profile_image: rawBounty.created_by.author_profile.profile_image,
            description: '',
            user: {
              id: rawBounty.created_by.id,
              first_name: rawBounty.created_by.author_profile.first_name,
              last_name: rawBounty.created_by.author_profile.last_name,
              email: '',
              is_verified: rawBounty.created_by.author_profile.is_verified,
            },
          },
          // Include metrics if available
          metrics: {
            votes: 0, // Default to 0 if not available
            comments: 0, // Default to 0 if not available
          },
        };

        console.log('feedEntry', feedEntry);

        return transformFeedEntry(feedEntry);
      });

      return {
        entries: transformedEntries,
        hasMore: !!response.next,
        total: response.count,
      };
    } catch (error) {
      console.error('Error fetching bounties:', error);
      // Return empty entries on error
      return {
        entries: [],
        hasMore: false,
        total: 0,
      };
    }
  }
}
