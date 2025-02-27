import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, FeedResponse } from '@/types/feed';

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feedView?: string;
    hubSlug?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feedView) queryParams.append('feed_view', params.feedView);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);

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
