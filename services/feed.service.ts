import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, FeedResponse } from '@/types/feed';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feed_view?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feed_view) queryParams.append('feed_view', params.feed_view);

    const url = `${this.BASE_PATH}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await ApiClient.get<FeedApiResponse>(url);

    const safeTransform = (entry: FeedResponse) => {
      try {
        return transformFeedEntry(entry);
      } catch (e) {
        console.error('Failed to transform feed entry:', entry);
        return null;
      }
    };

    return {
      entries: response.results.flatMap((entry) => safeTransform(entry) ?? []),
      hasMore: !!response.next,
    };
  }
}
