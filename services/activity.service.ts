import { ApiClient } from './client';
import { FeedEntry, FeedApiResponse, transformFeedEntry, RawApiFeedEntry } from '@/types/feed';

export type ActivityDocumentType = 'PREREGISTRATION' | 'GRANT' | 'DISCUSSION';

export type ActivityScope = 'grants' | 'peer_reviews' | 'financial';

export interface GetActivityParams {
  page?: number;
  pageSize?: number;
  documentType?: ActivityDocumentType;
  grantId?: number | string;
  scope?: ActivityScope;
}

export class ActivityService {
  private static readonly BASE_PATH = '/api/activity_feed';
  private static readonly DEFAULT_PAGE_SIZE = 25;

  static async getActivity(params?: GetActivityParams): Promise<{
    entries: FeedEntry[];
    hasMore: boolean;
  }> {
    const pageSize = params?.pageSize ?? this.DEFAULT_PAGE_SIZE;
    const queryParams = new URLSearchParams();
    if (params?.page) queryParams.append('page', params.page.toString());
    queryParams.append('page_size', pageSize.toString());
    if (params?.documentType) queryParams.append('document_type', params.documentType);
    if (params?.grantId) queryParams.append('grant_id', params.grantId.toString());
    if (params?.scope) queryParams.append('scope', params.scope);

    const qs = queryParams.toString();
    const url = `${this.BASE_PATH}/${qs ? `?${qs}` : ''}`;
    try {
      const response = await ApiClient.get<FeedApiResponse>(url);

      const entries = response.results
        .map((entry: RawApiFeedEntry) => {
          try {
            return transformFeedEntry(entry);
          } catch {
            return null;
          }
        })
        .filter((e): e is FeedEntry => e !== null);

      return { entries, hasMore: !!response.next };
    } catch (error) {
      console.error('Error fetching activity feed:', error);
      return { entries: [], hasMore: false };
    }
  }
}
