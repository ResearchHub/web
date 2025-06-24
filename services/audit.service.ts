import { ApiClient } from './client';
import { ID } from '@/types/root';

/**
 * AuditService - Handles administrative moderation and audit functionality
 *
 * This service is for:
 * - Fetching flagged content for moderation dashboard
 * - Moderator actions (dismiss, remove, etc.)
 * - Bulk administrative operations
 *
 * For individual user actions (flagging content), use ReactionService instead
 */

// Raw API response interface
interface FlaggedContentApiResponse {
  id: ID;
  flagged_by: {
    id: ID;
    author_profile: {
      id: ID;
      profile_image?: string;
    };
    first_name: string;
    last_name: string;
  };
  verdict?: {
    created_by: {
      id: ID;
      author_profile: {
        id: ID;
        profile_image?: string;
      };
      first_name: string;
      last_name: string;
    };
    created_date: string;
    verdict_choice: string;
  };
  reason: string;
  reason_choice: string;
  content_type: {
    id: ID;
    name: string;
  };
  item: any;
  created_date: string;
  hubs: any[];
}

// Normalized interface for our components
export interface FlaggedContent {
  id: ID;
  flaggedBy: {
    id: ID;
    authorProfile: {
      id: ID;
      firstName: string;
      lastName: string;
      profileImage?: string;
    };
  };
  verdict?: {
    createdBy: {
      id: ID;
      authorProfile: {
        id: ID;
        firstName: string;
        lastName: string;
        profileImage?: string;
      };
    };
    createdDate: string;
    verdictChoice: string;
  };
  reason: string;
  reasonChoice: string;
  contentType: {
    id: ID;
    name: string;
  };
  item: any;
  createdDate: string;
  hubs: any[];
}

export interface AuditFilters {
  hubId?: ID;
  verdict: 'OPEN' | 'REMOVED' | 'APPROVED';
}

export interface RemoveFlaggedContentParams {
  flagIds: ID[];
  verdictChoice?: string;
  sendEmail?: boolean;
}

export interface DismissFlaggedContentParams {
  flagIds: ID[];
  verdictChoice?: string;
}

export interface RemoveFlaggedPDFParams {
  flagIds: ID[];
  verdictChoice?: string;
}

interface FlaggedContentListApiResponse {
  results: FlaggedContentApiResponse[];
  next: string | null;
  previous: string | null;
  count?: number;
}

export interface FlaggedContentListResponse {
  results: FlaggedContent[];
  next: string | null;
  previous: string | null;
  count: number;
}

// Transform API response to our normalized format
const transformFlaggedContent = (apiItem: FlaggedContentApiResponse): FlaggedContent => ({
  id: apiItem.id,
  flaggedBy: {
    id: apiItem.flagged_by.id,
    authorProfile: {
      id: apiItem.flagged_by.author_profile.id,
      firstName: apiItem.flagged_by.first_name,
      lastName: apiItem.flagged_by.last_name,
      profileImage: apiItem.flagged_by.author_profile.profile_image,
    },
  },
  verdict: apiItem.verdict
    ? {
        createdBy: {
          id: apiItem.verdict.created_by.id,
          authorProfile: {
            id: apiItem.verdict.created_by.author_profile.id,
            firstName: apiItem.verdict.created_by.first_name,
            lastName: apiItem.verdict.created_by.last_name,
            profileImage: apiItem.verdict.created_by.author_profile.profile_image,
          },
        },
        createdDate: apiItem.verdict.created_date,
        verdictChoice: apiItem.verdict.verdict_choice,
      }
    : undefined,
  reason: apiItem.reason,
  reasonChoice: apiItem.reason_choice,
  contentType: {
    id: apiItem.content_type.id,
    name: apiItem.content_type.name,
  },
  item: apiItem.item,
  createdDate: apiItem.created_date,
  hubs: apiItem.hubs,
});

export class AuditService {
  /**
   * Fetch flagged content with optional filters and pagination
   */
  static async fetchFlaggedContent(
    filters: AuditFilters,
    pageUrl?: string
  ): Promise<FlaggedContentListResponse> {
    let fullUrl: string;

    if (pageUrl) {
      // Use the pageUrl directly since it already contains all necessary parameters
      fullUrl = pageUrl;
    } else {
      // Build URL with filters for initial request
      const url = '/api/audit/flagged/';
      const params = new URLSearchParams();

      if (filters.hubId) {
        params.append('hub_id', filters.hubId.toString());
      }
      if (filters.verdict) {
        params.append('verdict', filters.verdict);
      }

      const queryString = params.toString();
      fullUrl = queryString ? `${url}?${queryString}` : url;
    }

    const apiResponse = await ApiClient.get<FlaggedContentListApiResponse>(fullUrl);

    // Transform the API response to our normalized format
    return {
      results: apiResponse.results.map(transformFlaggedContent),
      next: apiResponse.next,
      previous: apiResponse.previous,
      count: apiResponse.count ?? apiResponse.results.length,
    };
  }

  /**
   * Remove flagged content
   */
  static async removeFlaggedContent(params: RemoveFlaggedContentParams): Promise<void> {
    const config = {
      flag_ids: params.flagIds,
      ...(params.verdictChoice && { verdict_choice: params.verdictChoice }),
      send_email: params.sendEmail ?? true, // Default to true as per API docs
    };

    await ApiClient.post('/api/audit/remove_flagged_content/', config);
  }

  /**
   * Dismiss flagged content (approve)
   */
  static async dismissFlaggedContent(params: DismissFlaggedContentParams): Promise<void> {
    const config = {
      flag_ids: params.flagIds,
      ...(params.verdictChoice && { verdict_choice: params.verdictChoice }),
    };

    await ApiClient.post('/api/audit/dismiss_flagged_content/', config);
  }

  /**
   * Remove flagged paper PDF only
   */
  static async removeFlaggedPaperPDF(params: RemoveFlaggedPDFParams): Promise<void> {
    const config = {
      flag_ids: params.flagIds,
      ...(params.verdictChoice && { verdict_choice: params.verdictChoice }),
    };

    await ApiClient.post('/api/audit/remove_flagged_paper_pdf/', config);
  }

  /**
   * Get count of flagged content
   */
  static async getFlaggedContentCount(): Promise<{ count: number }> {
    const response = await ApiClient.get<{ count: number }>('/api/audit/flagged_count/');
    return response;
  }

  /**
   * Bulk flag multiple content items (for administrative use)
   * For individual content flagging, use ReactionService.flag() instead
   */
  static async bulkFlagContent(params: {
    flags: Array<{
      contentType: ID;
      objectId: ID;
      reasonChoice: string;
      reason?: string;
    }>;
  }): Promise<void> {
    const config = {
      flag: params.flags.map((flag) => ({
        content_type: flag.contentType,
        object_id: flag.objectId,
        reason_choice: flag.reasonChoice,
        ...(flag.reason && { reason: flag.reason }),
      })),
    };

    await ApiClient.post('/api/audit/flag/', config);
  }

  /**
   * Flag and remove content in one action (for obvious violations)
   * This is for administrative use when content clearly violates policies
   */
  static async flagAndRemove(params: {
    flags: Array<{
      contentType: ID;
      objectId: ID;
      reasonChoice: string;
      reason?: string;
    }>;
    verdictChoice: string;
    sendEmail?: boolean;
  }): Promise<void> {
    const config = {
      flag: params.flags.map((flag) => ({
        content_type: flag.contentType,
        object_id: flag.objectId,
        reason_choice: flag.reasonChoice,
        ...(flag.reason && { reason: flag.reason }),
      })),
      verdict: {
        verdict_choice: params.verdictChoice,
        is_content_removed: true,
      },
      send_email: params.sendEmail ?? true,
    };

    await ApiClient.post('/api/audit/flag_and_remove/', config);
  }
}
