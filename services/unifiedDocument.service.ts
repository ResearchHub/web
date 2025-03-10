import { ApiClient } from './client';
import { FeedEntry, FundingRequest } from '@/types/feed';
import { ContentMetrics } from '@/types/metrics';
import { AuthorProfile } from '@/types/authorProfile';
import { Topic } from '@/types/topic';

/**
 * UnifiedDocumentService
 *
 * This service provides methods to interact with ResearchHub's unified document system.
 * The unified document system is a generic approach that allows different content types
 * (preregistrations, papers, posts, etc.) to be handled through a common API endpoint.
 *
 * Each content type is represented as a "document_type" in the unified document model,
 * which enables consistent querying, filtering, and presentation across different
 * research content formats while maintaining their type-specific properties.
 *
 * The service maps specialized API responses to our frontend models, making the underlying
 * data structure transparent to the components consuming this data.
 *
 * Database Context:
 * The unified document system is built on the "researchhub_document_researchhubunifieddocument"
 * table, which serves as a central model to combine different content types (papers, posts,
 * preregistrations) with common metadata such as scores, visibility, and publication dates.
 *
 * API Context:
 * The service primarily uses the "/api/researchhub_unified_document/get_unified_documents/"
 * endpoint, which provides a flexible interface to query and filter documents by type,
 * sort by different criteria, and paginate results consistently across content types.
 */

// Define the API response types
interface UnifiedDocumentApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: UnifiedDocumentResponseItem[];
}

/**
 * Represents a unified document item from the API response.
 * This structure combines common metadata with content-specific details,
 * allowing different document types to be handled through the same interface.
 */
interface UnifiedDocumentResponseItem {
  id: number;
  created_date: string;
  document_type: string; // Identifies the type: "preregistration", "paper", "post", etc.
  documents: Array<{
    id: number;
    title: string;
    abstract: string;
    created_by: {
      id: number;
      author_profile?: {
        id: number;
        first_name: string;
        last_name: string;
        profile_image: string;
        headline?: {
          title: string;
          isPublic: boolean;
        };
        created_date: string;
        updated_date: string;
        user: number;
      };
    };
    created_date: string;
    preview_img?: string;
    renderable_text: string;
    slug: string;
    discussion_count: number;
  }>;
  fundraise: {
    id: number;
    amount_raised: {
      usd: number;
      rsc: number;
    };
    goal_amount: {
      usd: number;
      rsc: number;
    };
    goal_currency: string;
    status: string;
    start_date: string;
    end_date: string;
    contributors: {
      total: number;
      top: any[];
    };
  };
  hubs: Array<{
    id: number;
    name: string;
    slug: string;
  }>;
  reviews: {
    avg: number;
    count: number;
  };
  score: number;
  hot_score: number;
  document_filter: {
    id: number;
    created_date: string;
    updated_date: string;
    peer_reviewed: boolean;
    open_access: boolean;
    has_bounty: boolean;
  };
}

// Default placeholder image for funding requests
const DEFAULT_PLACEHOLDER_IMAGE = '/Animated-Logo-v4.gif';

/**
 * Service for working with ResearchHub's unified document system.
 *
 * The unified document system provides a consistent way to interact with
 * different types of research content (preregistrations, papers, posts, etc.)
 * through a single API endpoint with type-specific parameters.
 *
 * This approach offers several advantages:
 * - Consistent filtering, sorting, and pagination across content types
 * - Unified permission model and content operations
 * - Seamless integration in feeds that display mixed content types
 * - Common base for search functionality
 */
export class UnifiedDocumentService {
  /**
   * Base endpoint path for retrieving unified documents.
   * This single endpoint handles all document types through query parameters.
   */
  private static readonly BASE_PATH = '/api/researchhub_unified_document/get_unified_documents';

  /**
   * Generic method to fetch documents of any type from the unified document system.
   *
   * @param type The document type to filter by ("preregistration", "paper", "post", etc.)
   * @param params Optional parameters for pagination, ordering, and filtering
   * @returns Promise with feed entries, pagination info, and total count
   */
  static async getDocuments(
    type: string,
    params?: {
      page?: number;
      pageSize?: number;
      ordering?: string;
      time?: string;
      hubSlug?: string;
    }
  ): Promise<{ entries: FeedEntry[]; hasMore: boolean; total: number }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.ordering) queryParams.append('ordering', params.ordering);
    if (params?.time) queryParams.append('time', params.time);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);

    // Add the document type filter
    queryParams.append('type', type);
    queryParams.append('ignore_excluded_homepage', 'true');

    const url = `${this.BASE_PATH}/?${queryParams.toString()}`;

    try {
      const response = await ApiClient.get<UnifiedDocumentApiResponse>(url);

      // Transform the unified document items to feed entries
      const entries = response.results.map((item): FeedEntry => {
        // Get the first document which contains title, abstract, etc.
        const document = item.documents[0] || {};

        // Create an AuthorProfile from the author_profile data
        let author: AuthorProfile | undefined = undefined;
        if (document.created_by?.author_profile) {
          const profile = document.created_by.author_profile;
          author = {
            id: profile.id,
            fullName: `${profile.first_name} ${profile.last_name}`.trim(),
            profileImage: profile.profile_image || '',
            profileUrl: `/profile/${profile.id}`,
            headline:
              typeof profile.headline === 'string'
                ? profile.headline
                : profile.headline?.title || '',
          };
        } else if (document.created_by) {
          // Fallback to created_by if author_profile is not available
          author = {
            id: document.created_by.id,
            fullName: 'Unknown Author',
            profileImage: '',
            profileUrl: `/profile/${document.created_by.id}`,
          };
        }

        // Create a topic from the first hub
        let topic: Topic;
        if (item.hubs && item.hubs.length > 0) {
          topic = {
            id: item.hubs[0].id,
            name: item.hubs[0].name,
            slug: item.hubs[0].slug,
          };
        } else {
          topic = {
            id: 0,
            name: 'General',
            slug: 'general',
          };
        }

        // Create the content object based on the type
        // For now we're handling FundingRequest, but this could be expanded
        const fundingRequest: FundingRequest = {
          id: item.id.toString(),
          type: 'funding_request',
          title: document.title || '',
          abstract: document.renderable_text || document.abstract || '',
          amount: item.fundraise?.amount_raised?.rsc || 0,
          goalAmount: item.fundraise?.goal_amount?.rsc || 0,
          goalAmountUsd: item.fundraise?.goal_amount?.usd || 0,
          status: (item.fundraise?.status as any) || 'OPEN',
          deadline: item.fundraise?.end_date || item.created_date,
          preregistered: type === 'preregistration', // Set based on type
          offersMementos: false, // Default value, update if available in API
          isTaxDeductible: false, // Default value, update if available in API
          actor: author,
          topic: topic,
          image: document.preview_img || DEFAULT_PLACEHOLDER_IMAGE,
          slug: document.slug,
          fundraiseId: item.fundraise?.id,
        };

        // Create metrics from available data
        const metrics: ContentMetrics = {
          votes: item.score || 0,
          comments: document.discussion_count || 0,
          reposts: 0, // Not available in the response
          saves: 0, // Not available in the response
        };

        // Store additional metadata in the feed entry
        const feedEntry: FeedEntry = {
          id: item.id.toString(),
          timestamp: item.created_date,
          content: fundingRequest,
          metrics,
          action: 'publish',
        };

        return feedEntry;
      });

      return {
        entries,
        hasMore: !!response.next,
        total: response.count,
      };
    } catch (error) {
      console.error(`Error fetching ${type} documents:`, error);
      return {
        entries: [],
        hasMore: false,
        total: 0,
      };
    }
  }

  /**
   * Specialized method to fetch preregistration documents.
   * This is a convenience wrapper around getDocuments that specifies the "preregistration" type.
   *
   * Preregistrations in ResearchHub are funding requests for proposed research
   * that are integrated into the unified document system. They contain:
   * - Standard unified document metadata (id, title, abstract, etc.)
   * - Fundraising information (goal amount, current amount, deadlines)
   * - RSC (ResearchCoin) display values instead of USD
   *
   * The fundraiseId field links preregistrations to the purchase_fundraise table,
   * which tracks fundraising campaigns, allowing for consistent rendering in both
   * the main feed and dedicated funding pages.
   *
   * @param params Optional parameters for pagination, ordering, and filtering
   * @returns Promise with feed entries, pagination info, and total count
   */
  static async getPreregistrations(params?: {
    page?: number;
    pageSize?: number;
    ordering?: string;
    time?: string;
    hubSlug?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean; total: number }> {
    return this.getDocuments('preregistration', params);
  }

  /**
   * Specialized method to fetch paper documents.
   * This is a convenience wrapper around getDocuments that specifies the "paper" type.
   *
   * @param params Optional parameters for pagination, ordering, and filtering
   * @returns Promise with feed entries, pagination info, and total count
   */
  static async getPapers(params?: {
    page?: number;
    pageSize?: number;
    ordering?: string;
    time?: string;
    hubSlug?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean; total: number }> {
    return this.getDocuments('paper', params);
  }

  /**
   * Specialized method to fetch post documents.
   * This is a convenience wrapper around getDocuments that specifies the "post" type.
   *
   * @param params Optional parameters for pagination, ordering, and filtering
   * @returns Promise with feed entries, pagination info, and total count
   */
  static async getPosts(params?: {
    page?: number;
    pageSize?: number;
    ordering?: string;
    time?: string;
    hubSlug?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean; total: number }> {
    return this.getDocuments('post', params);
  }
}
