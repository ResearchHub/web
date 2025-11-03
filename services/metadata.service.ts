import { ApiClient } from './client';
import { Topic } from '@/types/topic';
import type { AuthorProfile } from '@/types/authorProfile';
import { transformAuthorProfile } from '@/types/authorProfile';
import { ContentMetrics } from '@/types/metrics';
import { Fundraise, transformFundraise } from '@/types/funding';
import { Bounty, transformBounty } from '@/types/bounty';
import { countOpenBounties, countClosedBounties } from '@/components/Bounty/lib/bountyUtil';
import { HotScoreBreakdown } from '@/types/feed';

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
      conversationComments: document.discussion_aggregates.conversation_count || 0,
      reviewComments: document.discussion_aggregates.review_count || 0,
      bountyComments: document.discussion_aggregates.bounty_count || 0,
    },
    fundraising: response.fundraise ? transformFundraise(response.fundraise) : undefined,
    bounties: bounties,
    openBounties,
    closedBounties,
  };
}

export interface HotScoreData {
  hotScoreV2?: number;
  hotScoreBreakdown?: HotScoreBreakdown;
}

export class MetadataService {
  private static readonly BASE_PATH = '/api/researchhub_unified_document';
  private static readonly FEED_PATH = '/api/feed';

  static async get(unifiedDocumentId: string): Promise<WorkMetadata> {
    const response = await ApiClient.get<any>(
      `${this.BASE_PATH}/${unifiedDocumentId}/get_document_metadata/`
    );
    return transformWorkMetadata(response);
  }

  /**
   * Fetch hot score v2 data for a paper via FeedEntry API
   * Uses unified_document filtering with fallback to paginated search
   * @param paperId - The paper ID
   * @param unifiedDocumentId - The unified document ID from paper response
   * @param includeBreakdown - Whether to include breakdown data
   * @returns Hot score data or null if not found
   */
  static async getHotScore(
    paperId: number,
    unifiedDocumentId: number,
    includeBreakdown: boolean = true
  ): Promise<HotScoreData | null> {
    try {
      // Approach 1: Try filtering by unified_document (if supported)
      const queryParams = new URLSearchParams();
      queryParams.append('unified_document', unifiedDocumentId.toString());
      if (includeBreakdown) {
        queryParams.append('include_hot_score_breakdown', 'true');
      }

      const response = await ApiClient.get<any>(`${this.FEED_PATH}/?${queryParams.toString()}`);

      // Find FeedEntry matching this paper
      const feedEntry = response.results?.find(
        (entry: any) => entry.content_object?.id === paperId
      );

      if (feedEntry) {
        return {
          hotScoreV2: feedEntry.hot_score_v2,
          hotScoreBreakdown: includeBreakdown ? feedEntry.hot_score_breakdown : undefined,
        };
      }

      // Approach 2: Fallback - paginated search if filtering doesn't work
      return await this._searchFeedEntriesForPaper(paperId, unifiedDocumentId, includeBreakdown);
    } catch (error) {
      console.error('Error fetching hot score:', error);
      return null;
    }
  }

  /**
   * Fallback method: Search through feed entries via pagination
   */
  private static async _searchFeedEntriesForPaper(
    paperId: number,
    unifiedDocumentId: number,
    includeBreakdown: boolean
  ): Promise<HotScoreData | null> {
    let page = 1;
    const maxPages = 10; // Safety limit

    while (page <= maxPages) {
      try {
        const queryParams = new URLSearchParams();
        queryParams.append('page', page.toString());
        if (includeBreakdown) {
          queryParams.append('include_hot_score_breakdown', 'true');
        }

        const response = await ApiClient.get<any>(`${this.FEED_PATH}/?${queryParams.toString()}`);

        const feedEntry = response.results?.find(
          (entry: any) =>
            entry.unified_document?.id === unifiedDocumentId && entry.content_object?.id === paperId
        );

        if (feedEntry) {
          return {
            hotScoreV2: feedEntry.hot_score_v2,
            hotScoreBreakdown: includeBreakdown ? feedEntry.hot_score_breakdown : undefined,
          };
        }

        if (!response.next) break; // No more pages
        page++;
      } catch (error) {
        console.error(`Error fetching feed page ${page}:`, error);
        break;
      }
    }

    return null;
  }
}
