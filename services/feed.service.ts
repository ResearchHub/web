import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry } from '@/types/feed';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    action?: string;
    contentType?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.action) queryParams.append('action', params.action);
    if (params?.contentType) queryParams.append('content_type', params.contentType);

    const url = `${this.BASE_PATH}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await ApiClient.get<FeedApiResponse>(url);

    return {
      entries: response.results.map(transformFeedEntry),
      hasMore: !!response.next,
    };
  }
}
