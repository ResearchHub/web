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
  private static readonly BASE_PATH = '/api/activity_feed';
  private static readonly DEFAULT_PAGE_SIZE = 20;

  /** Removes this feed entry from public feeds. */
  static async excludeFromFeed(feedEntryId: ID): Promise<boolean> {
    const response = await ApiClient.post<any>(
      `${this.BASE_PATH}/${feedEntryId}/exclude_from_feed/`
    );
    return response.is_excluded_in_feed;
  }

  /** Restores this feed entry to public feeds. */
  static async includeInFeed(feedEntryId: ID): Promise<boolean> {
    const response = await ApiClient.post<any>(`${this.BASE_PATH}/${feedEntryId}/include_in_feed/`);
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
