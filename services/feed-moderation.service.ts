import { ApiClient } from './client';
import { ID } from '@/types/root';
import { transformExcludedFromFeedList, type ExcludedFromFeedList } from '@/types/feed';

interface ListExcludedFromFeedParams {
  page?: number;
  pageSize?: number;
  query?: string;
  pageUrl?: string;
}

export class FeedModerationService {
  private static readonly BASE_PATH = '/api/researchhub_unified_document';
  private static readonly DEFAULT_PAGE_SIZE = 20;

  /** Removes the document and its activity from public feeds. Detail pages are unaffected. */
  static async excludeFromFeed(unifiedDocumentId: ID): Promise<boolean> {
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${unifiedDocumentId}/exclude_from_feed/`
    );
    return response.is_excluded_in_feed;
  }

  /** Restores the document and its activity to public feeds. */
  static async includeInFeed(unifiedDocumentId: ID): Promise<boolean> {
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${unifiedDocumentId}/include_in_feed/`
    );
    return response.is_excluded_in_feed;
  }

  static async listExcludedFromFeed(
    params: ListExcludedFromFeedParams = {}
  ): Promise<ExcludedFromFeedList> {
    const path = params.pageUrl ?? this.buildListPath(params);
    const response = await ApiClient.get<any>(path);
    return transformExcludedFromFeedList(response);
  }

  private static buildListPath(params: ListExcludedFromFeedParams): string {
    const queryParams = new URLSearchParams();
    queryParams.set('page', String(params.page ?? 1));
    queryParams.set('page_size', String(params.pageSize ?? this.DEFAULT_PAGE_SIZE));
    const query = params.query?.trim();
    if (query) {
      queryParams.set('query', query);
    }
    return `${this.BASE_PATH}/excluded_from_feed/?${queryParams.toString()}`;
  }
}
