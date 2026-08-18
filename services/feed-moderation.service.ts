import { ApiClient } from './client';
import { ID } from '@/types/root';

interface ExcludeFromFeedResponse {
  id: number;
  is_excluded_in_feed: boolean;
}

export class FeedModerationService {
  private static readonly BASE_PATH = '/api/researchhub_unified_document';

  /** Removes the document and its activity from public feeds. Detail pages are unaffected. */
  static async excludeFromFeed(unifiedDocumentId: ID): Promise<boolean> {
    const response = await ApiClient.post<ExcludeFromFeedResponse>(
      `${this.BASE_PATH}/${unifiedDocumentId}/exclude_from_feed/`
    );
    return response.is_excluded_in_feed;
  }
}
