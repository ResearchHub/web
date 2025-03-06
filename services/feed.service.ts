import { ApiClient } from './client';
import { FeedEntry, transformFeedEntry } from '@/types/feed';

// Define the API response types
interface FeedApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: FeedResponseItem[];
}

interface FeedResponseItem {
  id: number;
  action: string;
  action_date: string;
  content_type: string;
  content_object: any;
}

export class FeedService {
  private static readonly BASE_PATH = '/api/feed';

  static async getFeed(params?: {
    page?: number;
    pageSize?: number;
    feedView?: string;
    hubSlug?: string;
    contentType?: string;
  }): Promise<{ entries: FeedEntry[]; hasMore: boolean }> {
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params?.feedView) queryParams.append('feed_view', params.feedView);
    if (params?.hubSlug) queryParams.append('hub_slug', params.hubSlug);
    if (params?.contentType) queryParams.append('content_type', params.contentType);

    const url = `${this.BASE_PATH}/${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await ApiClient.get<FeedApiResponse>(url);

    const safeTransform = (entry: FeedResponseItem) => {
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
